import React, { useState } from "react";
import "./LanguageTranslator.css";

const langCodes = {
  auto: "Auto-Detect",
  en: "English",
  ta: "Tamil (தமிழ்)",
  hi: "Hindi (हिन्दी)",
  te: "Telugu (తెలుగు)",
  kn: "Kannada (ಕನ್ನಡ)"
};

function LanguageTranslator() {
  const [isOpen, setIsOpen] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [srcLang, setSrcLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTranslate = async (e) => {
    e.preventDefault();
    if (!sourceText.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setTranslatedText("");

    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${srcLang}|${targetLang}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.responseStatus === 200 && data.responseData) {
        setTranslatedText(data.responseData.translatedText);
      } else {
        setErrorMsg(data.responseDetails || "Translation failed. Please try again.");
      }
    } catch (error) {
      console.error("Translation request failed", error);
      setErrorMsg("Unable to connect to translation server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    alert("Translated text copied to clipboard!");
  };

  const handleSwap = () => {
    if (srcLang === "auto") return;
    const temp = srcLang;
    setSrcLang(targetLang);
    setTargetLang(temp);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  return (
    <div className="global-translator-widget">
      {/* Floating Toggle Button */}
      <button 
        className={`translator-toggle-btn ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Open Translation Assistant"
      >
        <span className="translate-icon">🌐</span>
        {!isOpen && <span className="pulse-ring"></span>}
      </button>

      {/* Translator Panel */}
      {isOpen && (
        <div className="translator-panel-card">
          <div className="translator-panel-header">
            <h4>🌐 HIMS Translation Assistant</h4>
            <button className="panel-close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <form onSubmit={handleTranslate} className="translator-panel-body">
            <div className="language-select-row">
              <div className="select-wrapper">
                <label>From</label>
                <select value={srcLang} onChange={(e) => setSrcLang(e.target.value)}>
                  {Object.entries(langCodes).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>

              {srcLang !== "auto" && (
                <button type="button" className="swap-lang-btn" onClick={handleSwap} title="Swap Languages">
                  ⇄
                </button>
              )}

              <div className="select-wrapper">
                <label>To</label>
                <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                  {Object.entries(langCodes)
                    .filter(([code]) => code !== "auto")
                    .map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                </select>
              </div>
            </div>

            <div className="translator-input-area">
              <label>Enter Text</label>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Type details in Hindi, Telugu, Kannada, Tamil, or English here..."
                required
                rows={3}
              />
            </div>

            <button type="submit" className="translator-submit-btn" disabled={loading}>
              {loading ? "Translating..." : "Translate Text"}
            </button>

            {errorMsg && <div className="translator-error-alert">{errorMsg}</div>}

            {translatedText && (
              <div className="translator-output-area">
                <div className="output-header">
                  <label>Translation Result</label>
                  <button type="button" className="copy-text-btn" onClick={handleCopy}>
                    📋 Copy
                  </button>
                </div>
                <textarea
                  value={translatedText}
                  readOnly
                  rows={3}
                  className="translator-output-box"
                />
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

export default LanguageTranslator;
