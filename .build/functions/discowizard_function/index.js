'use strict';

require('dotenv').config();
const catalyst = require('zcatalyst-sdk-node');

module.exports = async (req, res) => {
  // Parse input
  let body = '';
  if (req.method === 'POST') {
    await new Promise((resolve) => {
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', resolve);
    });
  }
  let parsedBody = {};
  try { parsedBody = body ? JSON.parse(body) : {}; } catch (_e) { /* ignore */ }

  const answers = parsedBody.answers || {};
  if (!answers || Object.keys(answers).length === 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'Missing required "answers" object in request body.' }));
    return;
  }

  const role = (answers.role || '').toLowerCase();
  let framingRule;
  if (role.includes('owner') || role.includes('founder')) {
    framingRule = 'The reader is the owner/founder. Use a confident, directive voice. Speak to outcomes and ownership. "You own this — here\'s what to do."';
  } else if (role.includes('executive') || role.includes('director')) {
    framingRule = 'The reader is an executive or director. Use a strategic voice. Emphasize business impact, ROI, and risk. Keep it tight and outcome-focused.';
  } else if (role.includes('manager') || role.includes('lead')) {
    framingRule = 'The reader is a manager or team lead. Use an operational voice. Focus on what the team will do differently and how to sequence the work.';
  } else {
    framingRule = 'The reader is evaluating on behalf of leadership. Use third person ("the team should...", "leadership can..."). Produce something they can bring to a decision-maker.';
  }

  const prompt = `You are a business operations diagnostician. Analyze the provided business context and produce a platform-agnostic diagnosis. Never mention specific product or brand names (e.g., Zoho, HubSpot, Salesforce). Tool categories only (e.g., "a CRM platform", "a helpdesk system", "a shared inbox tool").

Return ONLY valid JSON matching this exact schema. No markdown, no code fences, no prose outside the JSON:
{
  "parsedSignals": {
    "root_cause_type": "process | people | technology | data",
    "problem_pattern": "firefighting | leakage | bottleneck | visibility | adoption_failure | missing_ownership | communication_breakdown",
    "urgency_signal": "low | medium | high"
  },
  "diagnostic": {
    "problemStatement": "1-2 sentences naming what's broken in plain language.",
    "rootCause": "1-2 sentences explaining why it is happening.",
    "severity": "Exactly 2 sentences: (1) urgency of acting now; (2) consequence of inaction.",
    "solutionRoadmap": [
      { "process": "One-sentence process step.", "toolCategory": "One sentence naming the tool category that would support it. No brand names." }
    ]
  }
}

Framing rule for this reader: ${framingRule}
Use the industry and sub-industry to tailor language and examples. solutionRoadmap must have 3 or 4 entries, ordered first-to-last by what to tackle first.

Business context:
${JSON.stringify(answers, null, 2)}`;

  const llmUrl = process.env.LLM_API_URL;
  const orgId = process.env.CATALYST_ORG_ID;
  const model = process.env.LLM_MODEL || 'crm-di-qwen_text_14b-fp8-it';

  const missing = [];
  if (!llmUrl) missing.push('LLM_API_URL');
  if (!orgId) missing.push('CATALYST_ORG_ID');
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

  const data = {
    prompt,
    model,
    system_prompt: 'You are a business operations diagnostician. Return only valid JSON matching the schema in the prompt. No prose outside the JSON, no markdown, no code fences.',
    top_p: 0.9,
    top_k: 50,
    best_of: 1,
    temperature: 0.3,
    max_tokens: 1200
  };

  try {
    const response = await fetch(llmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearer}`,
        'CATALYST-ORG': orgId
      },
      body: JSON.stringify(data)
    });

    console.log('QuickML status:', response.status);
    const rawText = await response.text();
    console.log('QuickML response:', rawText);

    if (!response.ok) {
      res.writeHead(response.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error', message: `QuickML returned ${response.status}`, debug: rawText }));
      return;
    }

    const raw = JSON.parse(rawText);
    const modelOutput = raw.output || raw.response || raw.choices?.[0]?.text || raw.result;

    if (!modelOutput) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error', message: 'No output field found', raw }));
      return;
    }

    // Qwen occasionally wraps output in ```json fences despite instructions.
    const cleaned = modelOutput.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.parsedSignals || !parsed.diagnostic) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error', message: 'LLM output missing parsedSignals or diagnostic.', raw: cleaned }));
      return;
    }

    // Fire-and-forget: log to Data Store. Errors swallowed so response still returns.
    logSession(app, {
      user_input: JSON.stringify(answers),
      ai_signals: JSON.stringify(parsed)
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'success', data: parsed }));

  } catch (err) {
    console.error('Error:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: err.message }));
  }
};

// Module-scope cache — warm invocations reuse this. Cold starts re-mint.
let cachedToken = { value: null, expiresAt: 0 };

// Mints a fresh Zoho OAuth access token from the refresh token, or returns cached.
// TODO: implement caching strategy below.
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

// Minimal Data Store logger. Table "WizardSessions" must exist with columns:
//   user_input (Text), ai_signals (Text). CREATEDTIME is built-in.
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
