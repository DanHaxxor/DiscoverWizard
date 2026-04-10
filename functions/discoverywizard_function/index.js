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

  // Build the LLM prompt
  const prompt = `Extract the following signals from this business description.
Return ONLY valid JSON, no explanation, no markdown, no code fences.

{
  "root_cause_type": "process | people | technology | data",
  "problem_pattern": "firefighting | leakage | bottleneck | visibility",
  "urgency_signal": "low | medium | high"
}

Input: ${userText}`;

  const llmUrl = "https://api.catalyst.zoho.in/quickml/v2/project/21181000000019009/llm/chat";

  // Get OAuth token via Catalyst Connector
  const app = catalyst.initialize(req);
  let accessToken;
  try {
    const connector = app.connection({
      QuickMLConnector: {
        client_id: '1000.NRG87QG7L9HGILWDK18W508K23P0WM',
        client_secret: process.env.QUICKML_CLIENT_SECRET,
        auth_url: 'https://accounts.zoho.in/oauth/v2/auth',
        refresh_url: 'https://accounts.zoho.in/oauth/v2/token',
        refresh_token: process.env.QUICKML_REFRESH_TOKEN,
        refresh_in: 3500
      }
    }).getConnector('QuickMLConnector');

    accessToken = await connector.getAccessToken();
    console.log("Got access token via connector");
  } catch (e) {
    console.error("Connector error:", e.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: "error", message: "Failed to get OAuth token: " + e.message }));
    return;
  }

  const data = {
    prompt: prompt,
    model: "crm-di-qwen_text_moe_30b",
    system_prompt: "You are a structured data extractor. Return only valid JSON with no additional text.",
    top_p: 0.9,
    top_k: 50,
    best_of: 1,
    temperature: 0.2,
    max_tokens: 200
  };

  try {
    const response = await fetch(llmUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Zoho-oauthtoken ${accessToken}`,
        "CATALYST-ORG": "60047883716"
      },
      body: JSON.stringify(data)
    });

    console.log("QuickML status:", response.status);
    const rawText = await response.text();
    console.log("QuickML response:", rawText);

    if (!response.ok) {
      res.writeHead(response.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: "error", message: `QuickML returned ${response.status}`, debug: rawText }));
      return;
    }

    const raw = JSON.parse(rawText);
    const modelOutput = raw.output || raw.response || raw.choices?.[0]?.text || raw.result;

    if (!modelOutput) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: "error", message: "No output field found", raw: raw }));
      return;
    }

    const parsed = JSON.parse(modelOutput.trim());
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: "success", data: parsed }));

  } catch (err) {
    console.error("Error:", err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: "error", message: err.message }));
  }
};
