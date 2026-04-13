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

  const userText = parsedBody.user_input
    || (req.url.includes('?') ? new URL(req.url, 'http://localhost').searchParams.get('user_input') : null)
    || "We lose track of leads after the first call and nobody owns follow-up";

  const prompt = `Extract the following signals from this business description.
Return ONLY valid JSON, no explanation, no markdown, no code fences.

{
  "root_cause_type": "process | people | technology | data",
  "problem_pattern": "firefighting | leakage | bottleneck | visibility",
  "urgency_signal": "low | medium | high"
}

Input: ${userText}`;

  const llmUrl = process.env.LLM_API_URL;
  const orgId = process.env.CATALYST_ORG_ID;
  const bearer = process.env.LLM_BEARER_TOKEN;
  const model = process.env.LLM_MODEL || 'crm-di-qwen_text_14b-fp8-it';

  const missing = [];
  if (!llmUrl) missing.push('LLM_API_URL');
  if (!orgId) missing.push('CATALYST_ORG_ID');
  if (!bearer) missing.push('LLM_BEARER_TOKEN');
  if (missing.length) {
    console.error('Missing env vars:', missing.join(', '));
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'Missing env vars: ' + missing.join(', ') }));
    return;
  }

  const app = catalyst.initialize(req);

  const data = {
    prompt,
    model,
    system_prompt: 'You are a structured data extractor. Return only valid JSON with no additional text.',
    top_p: 0.9,
    top_k: 50,
    best_of: 1,
    temperature: 0.2,
    max_tokens: 200
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

    const parsed = JSON.parse(modelOutput.trim());

    // Fire-and-forget: log to Data Store. Errors swallowed so response still returns.
    logSession(app, {
      user_input: userText,
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
