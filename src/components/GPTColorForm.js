import React, { useState, useEffect, useRef } from "react";
import { getCompanyColors } from "../api/gptApi";

const GPTColorForm = () => {
  const [prompt, setPrompt] = useState("");
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [topOffset, setTopOffset] = useState("-200px");
  const modalRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setColors([]);

    try {
      const result = await getCompanyColors(prompt);
      setColors(result);
    } catch (err) {
      console.error("Error getting company colors:", err);
      setError("Failed to fetch company colors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    // To position the modal above the button even if size changes
    if (isVisible && modalRef.current) {
      const modalHeight = modalRef.current.offsetHeight;
      setTopOffset(`-${modalHeight + 10}px`);
    }
  }, [isVisible, colors]);

  return (
    <div className="relative inline-block">
      <button
        onClick={toggleVisibility}
        className="px-4 py-2 text-white rounded-md focus:outline-none min-w-28"
      >
        {isVisible ? "Close" : "Ask from AI"}
      </button>

      {isVisible && (
        <div
          ref={modalRef}
          className="absolute left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg w-72 z-40 transition-all duration-300"
          style={{ top: topOffset }}
        >
          <h2 className="text-lg font-semibold mb-3">Get colors:</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="prompt"
                className="block text-sm font-medium text-gray-700"
              >
                Enter company name:
              </label>
              <input
                type="text"
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="..."
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
            >
              {loading ? "Fetching colors..." : "Submit"}
            </button>
          </form>

          {/* Display the colors */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">
              Received colors:
            </h3>
            <div
              className={
                colors.length > 0 ? "flex flex-wrap mt-2" : "invisible"
              }
            >
              {colors.map((color, index) => (
                <div
                  key={index}
                  className="w-16 h-8 flex text-xs items-center justify-center m-1 text-white font-semibold rounded-md border border-solid border-gray-400"
                  style={{ backgroundColor: color }}
                >
                  {color}
                </div>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default GPTColorForm;
