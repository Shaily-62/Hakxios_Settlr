import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import Footer from "../components/Footer";

function TenantLanding() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: "👋 Welcome to Settlr AI! I'm your personal rental assistant. I can help you find the perfect property based on your preferences. What kind of rental are you looking for?",
      time: "Just now"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Auto-resize textarea hook
  const textareaRef = useRef(null);
  const minHeight = 60;
  const maxHeight = 200;

  const adjustHeight = useCallback((reset) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (reset) {
      textarea.style.height = `${minHeight}px`;
      return;
    }

    textarea.style.height = `${minHeight}px`;
    const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight));
    textarea.style.height = `${newHeight}px`;
  }, [minHeight, maxHeight]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  const quickSuggestions = [
    "Show me 2BHK apartments in Bengaluru under ₹20,000",
    "Find pet-friendly rentals near metro stations",
    "What are the best neighborhoods for students?",
    "Show properties with parking available",
    "Find furnished apartments for couples"
  ];

  const handleSendMessage = (text) => {
    if (text.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'user',
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setInputValue("");
      adjustHeight(true);
      
      // Simulate AI typing
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const aiResponse = {
          id: messages.length + 2,
          type: 'ai',
          text: "🔍 I'm searching for properties that match your criteria. Let me analyze the available listings and find the best options for you...",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        handleSendMessage(inputValue);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-transparent via-[#26f50c]/10 to-transparent rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-transparent via-gray-200/20 to-transparent rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-[#26f50c]/5 via-transparent to-gray-100/10 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative z-10 flex-grow flex flex-col">
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={() => navigate("/landing")}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-800 transition-all duration-200 hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        {/* Vercel-style Chat Container */}
        <div className="flex-grow flex items-start justify-center px-4 pt-16 pb-8">
          <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
            <h1 className="text-4xl font-bold text-black dark:text-white text-center">
              What can I help you find?
            </h1>

            <div className="w-full">
              <div className="relative bg-neutral-900 rounded-xl border border-neutral-800">
                <div className="overflow-y-auto max-h-96 p-4 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-lg ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`px-4 py-3 rounded-2xl ${
                          message.type === 'user' 
                            ? 'bg-[#26f50c] text-black rounded-br-none' 
                            : 'bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200'
                        }`}>
                          <p className="text-sm leading-relaxed">{message.text}</p>
                        </div>
                        <p className={`text-xs text-gray-400 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-none border border-gray-200 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border-t border-neutral-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="p-2 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49 0L2.56 11.05a6 6 0 018.49 0l9.19 9.19a6 6 0 018.49 0l9.19-9.19a6 6 0 00-8.49 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.5 7.5v9M12 12.75h7.5" />
                      </svg>
                      <span className="text-xs text-zinc-400 hidden group-hover:inline transition-opacity">Attach</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-2 py-1 rounded-lg text-sm text-zinc-400 transition-colors border border-dashed border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-between gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Quick
                    </button>
                    <button
                      type="button"
                      className={`px-1.5 py-1.5 rounded-lg text-sm transition-colors border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-between gap-1 ${
                        inputValue.trim() ? "bg-white text-black" : "text-zinc-400"
                      }`}
                      onClick={() => handleSendMessage(inputValue)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span className="sr-only">Send</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default TenantLanding;
