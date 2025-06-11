//import { useState } from "react";
import { useState, CSSProperties, useRef } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);

export default function Home() {
  const [message, setMessage] = useState(
    'Analyze the attached image and determine if it contains a tomato leaf. If the image does not contain a tomato leaf, return the following JSON response: { "message": "The uploaded image is not a tomato leaf. We cannot process this information." }. If the image does contain a tomato leaf, identify any disease present and return the response in the following JSON format: { "disease_name": "<Name of the disease or Healthy>", "causes": ["<Cause 1>", "<Cause 2>", "..."], "prevention": ["<Prevention method 1>", "<Prevention method 2>", "..."], "cure": ["<Cure method 1>", "<Cure method 2>", "..."] }. If the leaf is healthy, set "disease_name": "Healthy" and leave "causes", "prevention", and "cure" as empty arrays.'
  );
  const [image, setImage] = useState(null);
  const [chat, setChat] = useState([]);
  const [final, setFinal] = useState({});
  const [preview, setPreview] = useState("");
  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#ffffff");
  const imgref= useRef(null);

  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };
  const sendMessage = async (e) => {
    if (!message.trim() && !image) return;

    const userMessage = { role: "user", content: message };
    setChat([...chat, userMessage]);

    setMessage(
      `"Analyze the attached image and determine if it contains a tomato leaf. If the image does not contain a tomato leaf, return the following JSON response: { \"message\": \"The uploaded image is not a tomato leaf. We cannot process this information.\" }. If the image does contain a tomato leaf, identify any disease present and return the response in the following JSON format: { \"disease_name\": \"<Name of the disease or 'Healthy'>\", \"causes\": [\"<Cause 1>\", \"<Cause 2>\", \"...\"], \"prevention\": [\"<Prevention method 1>\", \"<Prevention method 2>\", \"...\"], \"cure\": [\"<Cure method 1>\", \"<Cure method 2>\", \"...\"] }. If the leaf is healthy, set \"disease_name\": \"Healthy\" and leave \"causes\", \"prevention\", and \"cure\" as empty arrays."`
    );

    let imageUrl = null;
    if (image) {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      await new Promise((resolve) => (reader.onload = () => resolve()));
      imageUrl = reader.result;
    }

    try {
      setLoading(true);
      // Gemini direct call instead of API
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use free flash model
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
      setLoading(false);
      const botMessage = { role: "assistant", content: reply };
      function removeText(originalString, textToRemove) {
        return originalString.replace(new RegExp(textToRemove, "g"), "");
      }
      setFinal(
        JSON.parse(removeText(removeText(reply, "```json"), "```"))
      );
      setChat((prevChat) => [...prevChat, userMessage, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-cente">
      <div className=" w-full container ">
        <h1 className="bg-green-500 text-white font-bold text-center p-4  fixed top-0 left-0 right-0 z-10">
          Tomato Disease Detection and Classification
        </h1>
        <div className="chat-box mt-20">
          {/* <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          /> */}
          <div className="flex  my-5 px-2">
            <button onClick={()=>{
              imgref.current.click();
            }}
            className="px-4 fixed py-2 bg-green-200 text-black font-bold rounded-xl flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg> Add Image
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={imgref}
              onChange={(e) => {
                setImage(e.target.files[0]);
                setPreview(URL.createObjectURL(e.target.files[0]));
              }}
              capture="environment"
            />
          </div>
          <div className="flex justify-center">
            {preview && (
              <img
                src={preview}
                alt="Preview"
                style={{ width: "100px", marginTop: "10px" }}
              />
            )}
          </div>

          <div className="flex justify-center p-10">
            <button className="px-20 p-2 bg-green-500 text-white font-bold rounded-xl" onClick={sendMessage}>
              Send
            </button>
          </div>
{
  loading ? (
    <div className="flex justify-center items-center">
      <ClipLoader
        color={color}
        loading={loading}
        cssOverride={override}
        size={150}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  ) : <div className="text-white">
                  
                  {final.message ? (
                    <div> {final.message}</div>
                  ) : (
                    <div className="py-10 ">
                      <div className="font-bold text-center bg-black text-green-500 ">Disease Name</div>
                      <nav className="text-center py-4">
                        {final.disease_name}
                      </nav>

                      <div className="font-bold text-center mt-10 bg-black text-green-500">
                        Causes of Disease
                      </div>

                      <div className="flex flex-col ">
                        {final.causes &&
                          final.causes.map((cause,i) => {
                            return (
                              <nav key={i+"cau"} className="text-center py-2 text-xs">
                                {cause}
                              </nav>
                            );
                          })}
                      </div>
                      <div className="font-bold text-center mt-10 bg-black text-green-500">
                        Preventions of Disease
                      </div>

                      <div>
                        {final.prevention &&
                          final.prevention.map((cause,i) => {
                            return (
                              <nav key={i+"prev"} className="text-center py-2 text-xs">
                                {cause}
                              </nav>
                            );
                          })}
                      </div>

                      <div className="font-bold text-center mt-10 bg-black  text-green-500">
                        Cure of Disease
                      </div>

                      <div>
                        {final.cure &&
                          final.cure.map((cause,i) => {
                            return (
                              <nav key={i+"cu"} className="text-center py-2 text-xs">
                                {cause}
                              </nav>
                            );
                          })}
                      </div>
                      {/* {msg.content} */}
                    </div>
                  )}
                </div>
}
               
            
     
        </div>
      </div>
    </div>
  );
}
