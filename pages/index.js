import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [chat, setChat] = useState([]);
  const [preview, setPreview] = useState("");

  const sendMessage = async () => {
    if (!message.trim() && !image) return;

    const userMessage = { role: "user", content: message };
    setChat([...chat, userMessage]);

    setMessage(
      "Analyze this image. If it's a tomato leaf, identify any diseases (late blight, early blight, septoria leaf spot). If diseased, describe symptoms and provide prevention/cure measures. Otherwise, state 'Image is not of a tomato leaf'"
    );

    let imageUrl = null;
    if (image) {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      await new Promise((resolve) => (reader.onload = () => resolve()));
      imageUrl = reader.result;
    }

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, imageUrl }),
      });

      const data = await response.json();
      if (response.ok) {
        const botMessage = { role: "assistant", content: data.reply };
        setChat([...chat, userMessage, botMessage]);
      }
    } catch (error) {
      console.error("Error:", error);
    }

    setImage(null);
    setPreview("");
  };

  return (
    <div className="flex justify-center">
      <div className=" w-full container max-w-md">
        <h1 className="text-2xl font-bold text-center my-10">
          Tomato Disease Detection and Classification
        </h1>
        <div className="chat-box">
          {/* <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      /> */}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setImage(e.target.files[0]);
              setPreview(URL.createObjectURL(e.target.files[0]));
            }}
          />

          {preview && (
            <img
              src={preview}
              alt="Preview"
              style={{ width: "100px", marginTop: "10px" }}
            />
          )}

          <button onClick={sendMessage}>Send</button>
          {chat.map((msg, i) => (
            <p key={i} className={msg.role}>
              <div className="text-center">
                <strong>
                  {msg.role === "user"
                    ? "Query Informations: "
                    : " Prediction and results: "}
                </strong>
              </div>
              <div className="py-10 text-xs">{msg.content}</div>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
