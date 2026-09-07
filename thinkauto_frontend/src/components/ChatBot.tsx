import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, Sparkles, Loader2, Trash2, Minimize2, Maximize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface Message {
  role: "bot" | "user";
  text: string;
  timestamp: Date;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "bot", 
      text: "Hi! I'm ThinkAuto AI, your intelligent IT helpdesk assistant. I can help you with:\n\n• Technical troubleshooting\n• Software issues\n• Hardware problems\n• Network connectivity\n• Access requests\n• General IT queries\n\nHow can I assist you today?",
      timestamp: new Date()
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageToGroq = async (userMessage: string) => {
    try {
      const response = await api.post("/chat/message", {
        userMessage,
        conversationHistory: messages.slice(-10).map(m => ({
          role: m.role === "bot" ? "assistant" : "user",
          content: m.text
        }))
      });

      return response.response || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error: any) {
      console.error("Chat API error:", error);
      return "I'm having trouble connecting right now. Please try again in a moment or create a support ticket for immediate assistance.";
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message
    const newUserMessage: Message = {
      role: "user",
      text: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Get AI response
      const botResponse = await sendMessageToGroq(userMessage);
      
      // Add bot response
      const newBotMessage: Message = {
        role: "bot",
        text: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newBotMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { 
        role: "bot", 
        text: "Hi! I'm ThinkAuto AI, your intelligent IT helpdesk assistant. How can I assist you today?",
        timestamp: new Date()
      },
    ]);
    toast({
      title: "Chat cleared",
      description: "Conversation history has been reset.",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 z-50 rounded-full p-4 gradient-primary shadow-2xl glow-orange transition-shadow hover:shadow-primary/50 sm:bottom-6 sm:right-6 sm:p-5"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle className="w-7 h-7 text-primary-foreground" />
            <motion.span 
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed z-50 overflow-hidden rounded-2xl border border-border/50 glass-strong shadow-2xl ${
              isMinimized 
                ? 'bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-80' 
                : 'inset-x-2 bottom-2 max-h-[calc(100dvh-1rem)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[min(450px,calc(100vw-3rem))] lg:w-[min(500px,calc(100vw-3rem))]'
            }`}
            role="dialog"
            aria-label="ThinkAuto AI assistant"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 p-3 gradient-primary backdrop-blur-xl sm:p-4">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="relative">
                  <div className="gradient-primary rounded-full p-2">
                    <MessageCircle className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-display text-base font-bold text-primary-foreground sm:text-lg">ThinkAuto AI</span>
                    <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                  </div>
                  <p className="text-xs text-primary-foreground/80">Online • Always here to help</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="touch-target inline-flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4 text-primary-foreground/80 hover:text-primary-foreground" />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-primary-foreground/80 hover:text-primary-foreground" />
                  )}
                </button>
                <button 
                  onClick={clearChat}
                  className="touch-target inline-flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4 text-primary-foreground/80 hover:text-primary-foreground" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="touch-target inline-flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4 text-primary-foreground/80 hover:text-primary-foreground" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className={`overflow-y-auto p-3 sm:p-4 space-y-4 bg-gradient-to-b from-secondary/30 to-background ${
                  messages.length > 6 ? 'h-[min(52dvh,400px)] sm:h-[450px]' : 'h-[min(46dvh,350px)]'
                }`}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
                    >
                      {msg.role === "bot" && (
                        <div className="flex-shrink-0">
                          <div className="gradient-primary rounded-full p-2">
                            <MessageCircle className="w-4 h-4 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                      <div className={`flex min-w-0 max-w-[82%] flex-col sm:max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "gradient-primary text-primary-foreground shadow-lg"
                              : "glass border border-border/50 text-foreground shadow-md"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 px-1">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      {msg.role === "user" && (
                        <div className="flex-shrink-0">
                          <div className="bg-secondary border border-border/50 rounded-full p-2">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-[10px] font-bold text-white">
                              U
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start gap-2"
                    >
                      <div className="gradient-primary rounded-full p-2">
                        <MessageCircle className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="glass border border-border/50 rounded-2xl px-4 py-3">
                        <div className="flex gap-1.5">
                          <motion.div
                            className="w-2 h-2 bg-primary rounded-full"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-primary rounded-full"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-primary rounded-full"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-border/50 bg-background/50 p-3 backdrop-blur-xl sm:p-4">
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      placeholder="Ask me anything..."
                      disabled={isLoading}
                      className="min-w-0 flex-1 rounded-xl border border-border/50 bg-secondary/80 px-3 py-3 text-sm text-foreground outline-none backdrop-blur-sm transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 disabled:opacity-50 sm:px-4"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      className="touch-target shrink-0 rounded-xl px-3 text-primary-foreground gradient-primary shadow-lg transition-all hover:opacity-90 hover:shadow-primary/50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 text-center">
                    Powered by Groq AI • Press Enter to send
                  </p>
                </div>
              </>
            )}

            {isMinimized && (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Chat minimized</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
