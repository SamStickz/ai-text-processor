import React, { useState } from "react";
import axios from "axios";

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const HUGGINGFACE_API_KEY = process.env.REACT_APP_HUGGINGFACE_API_KEY;

function App() {
  const [text, setText] = useState("");
  const [processedText, setProcessedText] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("es"); // Default: Spanish
  const [isLoading, setIsLoading] = useState(false);

  const detectLanguage = async () => {
    if (!text.trim()) {
      alert("Please enter some text.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2/detect?key=${GOOGLE_API_KEY}`,
        { q: text }
      );
      const detectedLang = response.data.data.detections[0][0].language;
      setDetectedLanguage(detectedLang);
      setProcessedText(text);
    } catch (error) {
      console.error("Error detecting language:", error);
      alert("Failed to detect language.");
    }
    setIsLoading(false);
  };

  const translateText = async () => {
    if (!processedText) return;
    setIsLoading(true);
    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
        { q: processedText, target: selectedLanguage }
      );
      setTranslatedText(response.data.data.translations[0].translatedText);
    } catch (error) {
      console.error("Error translating text:", error);
      alert("Failed to translate text.");
    }
    setIsLoading(false);
  };

  const summarizeText = async () => {
    if (!processedText) return;
    if (detectedLanguage !== "en") {
      alert("Summarization is only available for English text.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        { inputs: processedText },
        {
          headers: {
            Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.length > 0) {
        setProcessedText(
          response.data[0].summary_text || "Summarization failed."
        );
      } else {
        alert("Error: No summary generated.");
      }
    } catch (error) {
      console.error(
        "Error summarizing text:",
        error.response?.data || error.message
      );
      alert("Failed to summarize text. Check console for details.");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
      <div className="bg-white shadow-xl rounded-lg p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
          AI Text Processor
        </h1>

        {/* Input Text Area */}
        <textarea
          className="w-full h-40 border p-3 text-gray-900 rounded-md focus:ring-2 focus:ring-blue-500"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text here..."
        ></textarea>

        {/* Buttons Section */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600"
            onClick={detectLanguage}
          >
            Detect Language
          </button>
        </div>

        {/* Output Section */}
        {processedText && (
          <div className="mt-6 p-4 border bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-800">
              Processed Text:
            </h2>
            <p className="text-gray-700">{processedText}</p>

            {/* Detected Language */}
            {detectedLanguage && (
              <p className="mt-2 text-gray-600">
                <strong>Detected Language:</strong>{" "}
                {detectedLanguage.toUpperCase()}
              </p>
            )}

            {/* Summarize Button */}
            {detectedLanguage === "en" && processedText.length > 150 && (
              <button
                className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded-md shadow-md hover:bg-yellow-600"
                onClick={summarizeText}
              >
                Summarize
              </button>
            )}

            {/* Translation Section */}
            <div className="mt-4">
              <label className="block text-gray-700">Translate To:</label>
              <select
                className="w-full mt-2 border p-2 rounded-md"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="pt">Portuguese</option>
                <option value="es">Spanish</option>
                <option value="ru">Russian</option>
                <option value="tr">Turkish</option>
                <option value="fr">French</option>
              </select>

              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
                onClick={translateText}
              >
                Translate
              </button>
            </div>

            {/* Translated Output */}
            {translatedText && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <h2 className="text-lg font-semibold text-gray-800">
                  Translated Text:
                </h2>
                <p className="text-gray-700">{translatedText}</p>
              </div>
            )}
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <p className="mt-4 text-gray-500 text-center">Processing...</p>
        )}
      </div>
    </div>
  );
}

export default App;
