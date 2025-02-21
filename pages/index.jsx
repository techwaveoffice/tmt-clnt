//import { useState } from "react";
import { useState, CSSProperties } from "react";
import ClipLoader from "react-spinners/ClipLoader";
export default function Home() {
  const [message, setMessage] = useState(
    'Analyze the attached image and determine if it contains a tomato leaf. If the image does not contain a tomato leaf, return the following JSON response: { "message": "The uploaded image is not a tomato leaf. We cannot process this information." }. If the image does contain a tomato leaf, identify any disease present and return the response in the following JSON format: { "disease_name": "<Name of the disease or \'Healthy\'>", "causes": ["<Cause 1>", "<Cause 2>", "..."], "prevention": ["<Prevention method 1>", "<Prevention method 2>", "..."], "cure": ["<Cure method 1>", "<Cure method 2>", "..."] }. If the leaf is healthy, set "disease_name": "Healthy" and leave "causes", "prevention", and "cure" as empty arrays.'
  );
  const [image, setImage] = useState(null);
  const [chat, setChat] = useState([]);
  const [final, setFinal] = useState({});
  const [preview, setPreview] = useState("");
  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#ffffff");

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
      setLoading(true)
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, imageUrl }),
      });

      const data = await response.json();
      if (response.ok) {
        setLoading(false)
        
        const botMessage = { role: "assistant", content: data.reply };
        function removeText(originalString, textToRemove) {
          return originalString.replace(new RegExp(textToRemove, "g"), "");
        }
        setFinal(
          JSON.parse(removeText(removeText(data.reply, "```json"), "```"))
        );
        
        setChat([...chat, userMessage, botMessage]);
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false)
    }

    //setImage(null);
    //setPreview("");
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
          <div className="flex justify-center my-5">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setImage(e.target.files[0]);
                setPreview(URL.createObjectURL(e.target.files[0]));
              }}
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
            <button className="px-20 p-2 bg-blue-500 text-white font-bold rounded-xl" onClick={sendMessage}>
              Send
            </button>
          </div>


      
          {chat.map((msg, i) => (
            <p key={i} className={msg.role}>
              <div className="text-center mb-5">
                <strong className="text-xl ">
                  {msg.role === "user"?<>
             {    loading && <div>
                  <ClipLoader
        color={color}
        loading={loading}
        cssOverride={override}
        size={150}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
                    </div>}
                    </>
                    : " Prediction and results: "}
                </strong>
              </div>

              {msg.role !== "user" && (
                <div>
                  {final.message ? (
                    <div> {final.message}</div>
                  ) : (
                    <div className="py-10 ">
                      <div className="font-bold text-center ">Disease Name</div>
                      <nav className="text-center py-4">
                        {final.disease_name}
                      </nav>

                      <div className="font-bold text-center mt-10 ">
                        Causes of Disease
                      </div>

                      <div>
                        {final.causes &&
                          final.causes.map((cause) => {
                            return (
                              <nav className="text-center py-2 text-xs">
                                {cause}
                              </nav>
                            );
                          })}
                      </div>
                      <div className="font-bold text-center mt-10 ">
                        Preventions of Disease
                      </div>

                      <div>
                        {final.prevention &&
                          final.prevention.map((cause) => {
                            return (
                              <nav className="text-center py-2 text-xs">
                                {cause}
                              </nav>
                            );
                          })}
                      </div>

                      <div className="font-bold text-center mt-10 ">
                        Cure of Disease
                      </div>

                      <div>
                        {final.cure &&
                          final.cure.map((cause) => {
                            return (
                              <nav className="text-center py-2 text-xs">
                                {cause}
                              </nav>
                            );
                          })}
                      </div>
                      {/* {msg.content} */}
                    </div>
                  )}
                </div>
              )}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
