// Standalone test — run with: node test-quickml.js <YOUR_TOKEN>
// Get token from: Catalyst console → Settings → API or run `catalyst token:generate`

const token = process.argv[2];
if (!token) {
  console.error("Usage: node test-quickml.js <bearer_token>");
  process.exit(1);
}

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

(async () => {
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
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    console.log("");

    const rawText = await response.text();
    console.log("Raw body:", rawText);
    console.log("");

    if (response.ok) {
      const parsed = JSON.parse(rawText);
      console.log("Parsed JSON keys:", Object.keys(parsed));
      console.log("Full parsed:", JSON.stringify(parsed, null, 2));
    }
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
})();
