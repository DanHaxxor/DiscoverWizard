'use strict';

require('dotenv').config();
const catalyst = require('zcatalyst-sdk-node');

module.exports = async (req, res) => {
  let body = '';
  if (req.method === 'POST') {
    await new Promise((resolve) => {
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', resolve);
    });
  }
  let parsedBody = {};
  try { parsedBody = body ? JSON.parse(body) : {}; } catch (_e) { /* ignore */ }

  // Client fires this on page load to wake the model before the user submits.
  // We respond 200 fast; the LLM call runs detached.
  if (parsedBody.warmup === true) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'warming' }));
    warmupLLM().catch(function (e) { console.warn('Warmup failed:', e && e.message); });
    return;
  }

  const answers = parsedBody.answers || {};
  const attempt = parsedBody.attempt || 1;
  if (!answers || Object.keys(answers).length === 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'Missing required "answers" object in request body.' }));
    return;
  }

  const role = (answers.role || '').toLowerCase();
  let framingRule;
  if (role.includes('owner') || role.includes('founder')) {
    framingRule = 'Reader is owner/founder. Directive voice: "you own this".';
  } else if (role.includes('executive') || role.includes('director')) {
    framingRule = 'Reader is executive/director. Strategic voice, ROI-focused.';
  } else if (role.includes('manager') || role.includes('lead')) {
    framingRule = 'Reader is manager/team-lead. Operational voice: what the team does.';
  } else {
    framingRule = 'Reader will bring this to leadership. Third person: "the team should".';
  }

  // Split the LLM-facing payload so evidence quotes can only be drawn from
  // actual free-text. `currentApproach` (PP2) and `userGuessDriver` (PP3) are
  // dropdown *selections* that happen to read as sentences — without this
  // split the model quotes them as if the user wrote them.
  const context = {};
  ['industry','subIndustry','users','role','b2b','breakdownArea','currentApproach','urgency','impact','currentSoftware','products'].forEach(function (k) {
    const v = answers[k];
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) return;
    context[k] = v;
  });
  if (answers.rootCause) context.userGuessDriver = answers.rootCause;

  const userOwnWords = {};
  if (answers.biggestWorry) userOwnWords.biggestWorry = answers.biggestWorry;
  if (answers.requirements) userOwnWords.requirements = answers.requirements;

  const TAG_SYSTEM = `Business ops tag extractor. Output ONLY JSON matching the schema — no prose, markdown, fences.

TAGS (pick one per list, never cross lists):
root_cause_type: process (broken steps) | people (ownership/adoption gap) | technology (tools can't do job / don't connect) | data (info missing/scattered).
problem_pattern: leakage (drops silently) | missing_ownership (nobody owns X) | bottleneck (queues at one step) | visibility (no single view) | adoption_failure (tool unused) | communication_breakdown (silos) | firefighting (last resort).
urgency_signal: high (active $ loss / critical) | medium (ongoing) | low (planning).

RULES:
- userOwnWords is the only source the user actually wrote. context fields are dropdown selections and background — never quote from context.
- biggestWorry in userOwnWords outweighs every structured field. Most-specific pattern wins.
- All quotes in interpretation and signalEvidence must be verbatim substrings of userOwnWords (full clauses — a complete thought, not single words). If userOwnWords doesn't cover a tag, quote the closest supporting clause rather than inventing or pulling from context.
- Return the empty string "" for a signalEvidence field only if userOwnWords is entirely empty.`;

  const TAG_PROMPT = `Output ONLY this JSON:
{"parsedSignals":{"root_cause_type":"process|people|technology|data","problem_pattern":"firefighting|leakage|bottleneck|visibility|adoption_failure|missing_ownership|communication_breakdown","urgency_signal":"low|medium|high"},"interpretation":"2-3 sentences explaining what userOwnWords reveals about the situation, quoting the user directly","signalEvidence":{"root_cause_type":"full verbatim clause from userOwnWords supporting this tag","problem_pattern":"full verbatim clause from userOwnWords supporting this tag","urgency_signal":"full verbatim clause from userOwnWords supporting this tag"}}

context (structured answers — do NOT quote from these):
${JSON.stringify(context)}

userOwnWords (the only source for quotes):
${JSON.stringify(userOwnWords)}`;

  const DIAG_SYSTEM = `Business ops diagnostician. Output ONLY valid JSON — no prose, markdown, fences. Never use brand names — tool categories only ("a CRM", "a helpdesk", "a shared inbox tool"). solutionRoadmap: 3-4 entries ordered first-to-last by what to tackle first.`;

  const DIAG_PROMPT = `Output ONLY this JSON:
{"diagnostic":{"problemStatement":"1-2 sentences naming what's broken","rootCause":"1-2 sentences explaining why it's happening","severity":"exactly 2 sentences: urgency now + consequence of inaction","solutionRoadmap":[{"process":"one sentence process step","toolCategory":"one sentence tool category, no brand names"}]}}

Reader framing: ${framingRule}

context:
${JSON.stringify(context)}

userOwnWords:
${JSON.stringify(userOwnWords)}`;

  const llmUrl = process.env.LLM_API_URL;
  const orgId = process.env.ZOHO_ORG_ID;
  const model = process.env.LLM_MODEL || 'crm-di-qwen_text_moe_30b';

  const missing = [];
  if (!llmUrl) missing.push('LLM_API_URL');
  if (!orgId) missing.push('ZOHO_ORG_ID');
  if (!process.env.CLIENT_ID) missing.push('CLIENT_ID');
  if (!process.env.CLIENT_SECRET) missing.push('CLIENT_SECRET');
  if (!process.env.REFRESH_TOKEN) missing.push('REFRESH_TOKEN');
  if (missing.length) {
    console.error('Missing env vars:', missing.join(', '));
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'Missing env vars: ' + missing.join(', ') }));
    return;
  }

  let bearer;
  try {
    bearer = await getAccessToken();
  } catch (err) {
    console.error('Token mint failed:', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'OAuth token refresh failed: ' + err.message }));
    return;
  }

  const app = catalyst.initialize(req);
  const t0 = Date.now();
  const requestId = Math.random().toString(36).slice(2, 10);
  const llm = { bearer, llmUrl, orgId, model, requestId };

  // QuickML's max_tokens is total context (input + output), not output-only.
  // 1024 covers both prompts with headroom; model stops naturally when JSON completes.
  const [tagResult, diagResult] = await Promise.all([
    callLLM('tag', TAG_PROMPT, TAG_SYSTEM, 1024, llm),
    callLLM('diag', DIAG_PROMPT, DIAG_SYSTEM, 1024, llm)
  ]);

  const latencyMs = Date.now() - t0;
  const debugBlock = {
    requestId,
    tag:  { prompt: TAG_PROMPT,  raw: tagResult.rawText,  latencyMs: tagResult.latency,  status: tagResult.status, usage: tagResult.usage },
    diag: { prompt: DIAG_PROMPT, raw: diagResult.rawText, latencyMs: diagResult.latency, status: diagResult.status, usage: diagResult.usage },
    model,
    latencyMs,
    attempts: attempt
  };

  if (!tagResult.ok) {
    const code = tagResult.err === 'timeout' ? 504 : 502;
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'Tag call failed: ' + tagResult.err, _debug: debugBlock }));
    return;
  }
  if (!diagResult.ok) {
    const code = diagResult.err === 'timeout' ? 504 : 502;
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'Diag call failed: ' + diagResult.err, _debug: debugBlock }));
    return;
  }

  if (!tagResult.parsed.parsedSignals || !tagResult.parsed.interpretation || !tagResult.parsed.signalEvidence) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'Tag response missing required fields', _debug: debugBlock }));
    return;
  }
  if (!diagResult.parsed.diagnostic) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'Diag response missing diagnostic', _debug: debugBlock }));
    return;
  }

  // A tag value outside its list silently corrupts downstream scoring — hard fail.
  const ALLOWED = {
    root_cause_type: ['process', 'people', 'technology', 'data'],
    problem_pattern: ['firefighting', 'leakage', 'bottleneck', 'visibility', 'adoption_failure', 'missing_ownership', 'communication_breakdown'],
    urgency_signal:  ['low', 'medium', 'high']
  };
  const vocabErrors = [];
  for (const tag in ALLOWED) {
    const value = tagResult.parsed.parsedSignals[tag];
    if (!value) { vocabErrors.push(tag + ' missing'); continue; }
    if (ALLOWED[tag].indexOf(value) === -1) {
      vocabErrors.push(tag + '="' + value + '" not in [' + ALLOWED[tag].join(',') + ']');
    }
  }
  if (vocabErrors.length) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'Tag vocabulary violation: ' + vocabErrors.join('; '), _debug: debugBlock }));
    return;
  }

  // Fire-and-forget — log failures must not block the user's response.
  logSession(app, {
    user_input:      JSON.stringify(answers),
    ai_signals:      JSON.stringify(tagResult.parsed),
    prompt:          TAG_PROMPT + '\n---\n' + DIAG_PROMPT,
    raw_response:    tagResult.rawText + '\n---\n' + diagResult.rawText,
    latency_ms:      latencyMs,
    interpretation:  tagResult.parsed.interpretation,
    signal_evidence: JSON.stringify(tagResult.parsed.signalEvidence)
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'success',
    data: {
      parsedSignals:  tagResult.parsed.parsedSignals,
      interpretation: tagResult.parsed.interpretation,
      signalEvidence: tagResult.parsed.signalEvidence,
      diagnostic:     diagResult.parsed.diagnostic
    },
    _debug: debugBlock
  }));
};

async function callLLM(label, prompt, systemPrompt, maxTokens, llm) {
  const tag = `[${label} req:${llm.requestId}]`;
  const t0 = Date.now();
  const ctrl = new AbortController();
  const timeoutId = setTimeout(function () { ctrl.abort(); }, 27000);
  let rawText = '';
  let status = 0;
  try {
    const resp = await fetch(llm.llmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${llm.bearer}`,
        'CATALYST-ORG': llm.orgId
      },
      body: JSON.stringify({
        prompt,
        model: llm.model,
        system_prompt: systemPrompt,
        top_p: 0.9,
        top_k: 50,
        best_of: 1,
        temperature: 0.3,
        max_tokens: maxTokens
      }),
      signal: ctrl.signal
    });
    status = resp.status;
    rawText = await resp.text();
    const latency = Date.now() - t0;
    console.log(tag, 'status:', status, 'latency:', latency + 'ms');
    if (!resp.ok) return { ok: false, status, rawText, latency, err: 'QuickML ' + status };
    const upstream = JSON.parse(rawText);
    const usage = upstream.usage || null;
    if (usage) console.log(tag, 'tokens:', usage.prompt_tokens, '+', usage.completion_tokens, '=', usage.total_tokens);
    const output = upstream.output || upstream.response || (upstream.choices && upstream.choices[0] && upstream.choices[0].text) || upstream.result;
    if (!output) return { ok: false, status, rawText, latency, usage, err: 'no output field' };
    const cleaned = output.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleaned);
    return { ok: true, status, rawText, latency, usage, parsed };
  } catch (err) {
    const latency = Date.now() - t0;
    const isAbort = err && err.name === 'AbortError';
    console.error(tag, 'error:', isAbort ? 'timeout' : err.message, 'latency:', latency + 'ms');
    return { ok: false, status, rawText, latency, err: isAbort ? 'timeout' : (err && err.message) };
  } finally {
    clearTimeout(timeoutId);
  }
}

// Module-scope cache survives warm invocations; cold starts re-mint.
let cachedToken = { value: null, expiresAt: 0 };

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken.value && now < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    refresh_token: process.env.REFRESH_TOKEN
  });

  const resp = await fetch('https://accounts.zoho.com/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const json = await resp.json();
  if (!resp.ok || !json.access_token) {
    throw new Error(`Zoho OAuth ${resp.status}: ${JSON.stringify(json)}`);
  }

  cachedToken.value = json.access_token;
  cachedToken.expiresAt = now + (json.expires_in - 300) * 1000;
  return cachedToken.value;
}

// Trivial call on page-load to wake the model before the user's real request.
// Not critical path — errors are swallowed.
async function warmupLLM() {
  const llmUrl = process.env.LLM_API_URL;
  const orgId = process.env.ZOHO_ORG_ID;
  const model = process.env.LLM_MODEL || 'crm-di-qwen_text_moe_30b';
  if (!llmUrl || !orgId || !process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.REFRESH_TOKEN) return;

  const bearer = await getAccessToken();
  const ctrl = new AbortController();
  const timeoutId = setTimeout(function () { ctrl.abort(); }, 8000);
  try {
    const resp = await fetch(llmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearer}`,
        'CATALYST-ORG': orgId
      },
      body: JSON.stringify({
        prompt: 'Reply with ok.',
        model,
        system_prompt: 'Respond with a single word.',
        top_p: 0.9,
        top_k: 50,
        best_of: 1,
        temperature: 0.1,
        max_tokens: 50
      }),
      signal: ctrl.signal
    });
    const body = await resp.text();
    console.log('[warmup] status:', resp.status, 'body:', body.slice(0, 200));
  } finally {
    clearTimeout(timeoutId);
  }
}

// Writes to Data Store table "WizardSessions" (must exist with matching columns).
// Errors swallowed to keep the user's response unblocked.
function logSession(app, payload) {
  try {
    const table = app.datastore().table('WizardSessions');
    table.insertRow(payload)
      .then(() => console.log('Session logged'))
      .catch((e) => console.warn('Session log failed:', e && e.message));
  } catch (e) {
    console.warn('Session log skipped:', e && e.message);
  }
}
