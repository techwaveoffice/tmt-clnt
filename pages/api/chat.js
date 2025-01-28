import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use environment variable for security
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message, imageUrl } = req.body; // Get user message & image URL from request

    let messages = [
      { role: "user", content: [{ type: "text", text: message }] },
    ];

    // If an image is provided, add it to the request
    if (imageUrl) {
      messages[0].content.push({
        type: "image_url",
        image_url: { url: imageUrl },
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages,
    });

    res.status(200).json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch response from OpenAI" });
  }
}
