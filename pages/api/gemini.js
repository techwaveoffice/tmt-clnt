import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb", // ✅ Increase size limit (e.g., 10MB)
    },
  },
};

const genAI = new GoogleGenerativeAI("AIzaSyCgiSNoIUQHsjJ0z31gVMZ5sHnuhLGriUM");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message, imageUrl } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let contents = [{ role: "user", parts: [{ text: message }] }];

    // ✅ Check if an image is provided
    if (imageUrl) {
      contents[0].parts.push({
        inlineData: { mimeType: "image/png", data: imageUrl.split(",")[1] },
      });
    }

    const response = await model.generateContent({ contents });
    const reply = response.response.candidates[0].content.parts[0].text;

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch response from Gemini" });
  }
}
