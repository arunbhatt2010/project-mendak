
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  const message = req.body?.message;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: "Groq API key is missing"
    });
  }

  if (
    typeof message !== "string" ||
    !message.trim() ||
    message.length > 2000
  ) {
    return res.status(400).json({
      success: false,
      error: "Valid message required"
    });
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content: `You are Mendak, the AI User Supporter for TruthLoop AI.

Help users understand TruthLoop features, investigation stages,
reports, public evidence and Confidence Scores.

Be friendly, concise and helpful.
Never answer guided investigation questions on behalf of users.
Never influence their personal answers.
Never invent report findings or evidence.
If unsure, say so honestly.
Reply in the user's language.`
            },
            {
              role: "user",
              content: message.trim()
            }
          ],
          max_completion_tokens: 500
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error:", response.status, data);
      return res.status(502).json({
        success: false,
        error: "AI provider request failed"
      });
    }

    return res.status(200).json({
      success: true,
      reply: data.choices?.[0]?.message?.content || ""
    });

  } catch (error) {
    console.error("Mendak error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to generate response"
    });
  }
}
