import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },
};

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message, imageUrl } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // safer model

    let contents = [{ role: "user", parts: [{ text: message }] }];

    if (imageUrl) {
      contents[0].parts.push({
        inlineData: {
          mimeType: "image/png",
          data: imageUrl.split(",")[1],
        },
      });
    }

    const result = await model.generateContent({ contents });
    const reply = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "No reply.";

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(error.status || 500).json({
      error: error.message || "Failed to fetch response from Gemini",
      details: error,
    });
  }
}
