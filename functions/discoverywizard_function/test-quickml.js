// Standalone test — run with: node test-quickml.js
// Automatically reads token from Catalyst CLI config, or pass one manually: node test-quickml.js <token>

const fs = require('fs');
const path = require('path');

async function getToken() {
  // Check for manual token arg
  if (process.argv[2]) return process.argv[2];

  // Read from Catalyst CLI config
  const configPath = path.join(
    require('os').homedir(),
    'Library/Preferences/zcatalyst-cli-nodejs/zcatalyst-cli.json'
  );
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const cred = config?.in?.credential;
    if (cred) {
      // The credential is a refresh token — we need to exchange it for an access token
      // For now, let's try using it directly and see what happens
      console.log("Found CLI credential (length:", cred.length, ")");
      return cred;
    }
  } catch (e) {
    console.log("Could not read CLI config:", e.message);
  }

  console.error("No token found. Pass one as argument: node test-quickml.js <token>");
  process.exit(1);
}

(async () => {
  const token = await getToken();

  const userText = "We lose track of leads after the first call and nobody owns follow-up";

  const prompt = `Extract the following signals from this business description.
Return ONLY valid JSON, no explanation, no markdown, no code fences.

{
  "root_cause_type": "process | people | technology | data",
  "problem_pattern": "firefighting | leakage | bottleneck | visibility",
  "urgency_signal": "low | medium | high"
}

Input: ${userText}`;

  const url = "https://api.catalyst.zoho.in/quickml/v2/project/21181000000019009/llm/chat";

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

  console.log("=== QuickML API Test ===");
  console.log("URL:", url);
  console.log("Input:", userText);
  console.log("");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "CATALYST-ORG": "60047883716"
      },
      body: JSON.stringify(data)
    });

    console.log("Status:", response.status, response.statusText);
    console.log("");

    const rawText = await response.text();
    console.log("Raw body:", rawText);
    console.log("");

    if (response.ok) {
      const parsed = JSON.parse(rawText);
      console.log("Parsed keys:", Object.keys(parsed));
      console.log("Full response:", JSON.stringify(parsed, null, 2));
    }
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
})();
