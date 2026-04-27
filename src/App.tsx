import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  Sparkles, 
  Image as ImageIcon, 
  Camera, 
  Layout, 
  Settings, 
  User, 
  ChevronRight, 
  Search, 
  Plus, 
  Bell,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  CreditCard,
  Zap,
  ArrowRight,
  MessageSquare,
  Send,
  Bot,
  History,
  Paperclip,
  Video,
  X,
  Maximize,
  Minimize
} from 'lucide-react';

// --- Types ---
type View = 'login' | 'dashboard' | 'generator' | 'profile' | 'chat' | 'settings';

interface Attachment {
  type: 'image' | 'video';
  url: string;
  name: string;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  attachments?: Attachment[];
}

// --- Components ---

const FloatingOrbs = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      animate={{
        x: [0, 40, 0],
        y: [0, -60, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }}
      className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-colors duration-1000 ${isDarkMode ? 'bg-blue-600/10' : 'bg-blue-400/20'}`}
    />
    <motion.div
      animate={{
        x: [0, -50, 0],
        y: [0, 70, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: "linear"
      }}
      className={`absolute bottom-[-10%] right-[-20%] w-[70%] h-[70%] rounded-full blur-[120px] transition-colors duration-1000 ${isDarkMode ? 'bg-purple-600/10' : 'bg-purple-400/20'}`}
    />
    <motion.div
      animate={{
        x: [0, 100, 0],
        y: [0, 100, 0],
      }}
      transition={{
        duration: 30,
        repeat: Infinity,
        ease: "linear"
      }}
      className={`absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full blur-[80px] transition-colors duration-1000 ${isDarkMode ? 'bg-emerald-600/5' : 'bg-emerald-400/10'}`}
    />
  </div>
);

const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`glass rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] ${className}`}>
    {children}
  </div>
);

const NavButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-blue-400' : 'text-zinc-500'}`}
  >
    <div className={`p-2 rounded-xl transition-all ${active ? 'bg-blue-500/20' : ''}`}>
      <Icon size={24} />
    </div>
    <span className="text-[10px] font-medium uppercase tracking-widest">{label}</span>
  </button>
);

const ThinkingIndicator = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, x: -10 }}
    animate={{ opacity: 1, scale: 1, x: 0 }}
    className="flex justify-start mb-4"
  >
    <div className="relative group">
      {/* Animated glowing background */}
      <motion.div
        animate={{
          background: [
            "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
            "linear-gradient(45deg, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute inset-0 blur-xl opacity-50"
      />
      
      <div className={`p-4 rounded-3xl rounded-tl-none flex gap-3 items-center border relative backdrop-blur-md overflow-hidden ${isDarkMode ? 'glass-dark border-white/5 bg-white/10' : 'bg-white/80 border-slate-200/50 shadow-sm'}`}>
        {/* Shimmer effect */}
        <motion.div
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute inset-0 bg-gradient-to-r from-transparent ${isDarkMode ? 'via-white/5' : 'via-slate-500/5'} to-transparent -skew-x-12`}
        />
        
        <div className="flex gap-1.5 items-center relative z-10">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 1, 0.3],
                backgroundColor: isDarkMode ? ["#64748b", "#3b82f6", "#64748b"] : ["#94a3b8", "#3b82f6", "#94a3b8"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
              className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'shadow-[0_0_8px_rgba(59,130,246,0.3)]'}`}
            />
          ))}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest relative z-10 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>KBot is thinking</span>
      </div>
    </div>
  </motion.div>
);

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am KBot. How can I help you be creative today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);
  const [chatBackground, setChatBackground] = useState<string | null>(null);
  const [bgOpacity, setBgOpacity] = useState(0.2);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Generator State
  const [genPrompt, setGenPrompt] = useState('');
  const [genImage, setGenImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [recentGenerations, setRecentGenerations] = useState<{id: number, url: string, prompt: string, time: string}[]>([]);

  // Initialize AI
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'background') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'background') {
        setChatBackground(url);
      } else {
        setAttachments(prev => [...prev, { type: type as 'image' | 'video', url, name: file.name }]);
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && attachments.length === 0) || isTyping) return;

    const userText = inputMessage;
    const currentAttachments = [...attachments];
    
    setInputMessage('');
    setAttachments([]);
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      text: userText,
      attachments: currentAttachments 
    }]);
    setIsTyping(true);

    try {
      const response = await genAI.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: [
          ...messages.map(m => ({
            role: m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: userText }] }
        ],
        config: {
          systemInstruction: "You are KBot, a helpful creative assistant. CRITICAL: Never use the asterisk character '*' in your responses for any reason. Provide plain text responses only, do not use markdown bolding."
        }
      });

      let assistantText = "";
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of response) {
        const chunkText = chunk.text || "";
        assistantText += chunkText.replace(/\*/g, '');
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', text: assistantText };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!genPrompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setGenImage(null);
    setIsImageLoading(true);
    try {
      let refinedPrompt = genPrompt;
      try {
        const response = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{
            role: 'user',
            parts: [{ text: `Act as a professional prompt engineer. Transform this simple idea into a detailed, high-quality, artistic image generation prompt: "${genPrompt}". Focus on style, lighting, composition, and mood. RETURN ONLY THE ENHANCED PROMPT TEXT, NOTHING ELSE. NO INTRO, NO OUTRO, NO QUOTES.` }]
          }]
        });
        if (response && response.text) {
          refinedPrompt = response.text.trim().replace(/^["']|["']$/g, '');
        }
      } catch (e) {
        console.warn("Prompt enhancement failed, using original prompt", e);
      }

      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(refinedPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`;
      
      setGenImage(imageUrl);
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToRecent = () => {
    if (!genImage) return;
    const newGen = {
      id: Date.now(),
      url: genImage,
      prompt: genPrompt,
      time: 'Just now'
    };
    setRecentGenerations(prev => [newGen, ...prev].slice(0, 5));
    setCurrentView('dashboard');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-[#f8fafc] text-slate-900'} transition-colors duration-500 relative overflow-hidden`}>
      <FloatingOrbs isDarkMode={isDarkMode} />

      <AnimatePresence mode="wait">
        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="pb-32 px-6 pt-16 relative z-10"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm font-medium`}>Hello, Alex</p>
                <h2 className="text-2xl font-bold">Ready to <span className="gradient-text">create</span> today?</h2>
              </div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-12 h-12 glass rounded-2xl flex items-center justify-center transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500 hover:text-blue-600'}`}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            {/* Quick Actions (Bento Grid) */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 0.1 }
                }
              }}
              className="grid grid-cols-2 gap-4 mb-8"
            >
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView('generator')}
                className={`col-span-2 h-48 rounded-[32px] p-6 flex flex-col justify-between border transition-all ${isDarkMode ? 'glass-dark border-white/5' : 'bg-white border-slate-200/50 shadow-sm shadow-blue-900/5'}`}
              >
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <ImageIcon size={24} className="text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AI Image Gen</h3>
                  <p className="text-slate-500 text-sm">Create visuals from text prompt</p>
                </div>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <GlassCard className="h-40 flex flex-col justify-between rounded-3xl border-white/10">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                    <Camera size={20} />
                  </div>
                  <div>
                    <span className="pill bg-indigo-500/20 text-indigo-400 mb-2 inline-block">Magic</span>
                    <h3 className="font-bold text-sm">Magic Edit</h3>
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <GlassCard className="h-40 flex flex-col justify-between rounded-3xl border-white/10">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <span className="pill bg-emerald-500/20 text-emerald-400 mb-2 inline-block">Writer</span>
                    <h3 className="font-bold text-sm">Text Fix</h3>
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>

            {/* AI Assistant Banner */}
            <div className={`p-4 rounded-2xl border transition-all ${isDarkMode ? 'glass border-blue-500/30 bg-blue-500/5' : 'bg-blue-50 border-blue-100/50'} mb-8`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className={`text-xs font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>AI ASSISTANT ACTIVE</span>
              </div>
              <p className={`text-sm italic ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>"I'm ready to transform your ideas into stunning visuals."</p>
            </div>

            {/* Recent Work */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Recent Builds</h3>
              <span className="text-blue-400 text-xs font-semibold">View All</span>
            </div>
            <div className="space-y-3">
              {recentGenerations.length === 0 ? (
                <div className="glass p-8 rounded-3xl text-center border-dashed border-2 border-white/5">
                  <p className="text-slate-500 text-sm italic">No creations yet. Start generating!</p>
                </div>
              ) : (
                recentGenerations.map((gen, idx) => (
                  <motion.div 
                    key={gen.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-4 glass p-4 rounded-2xl action-card transition-all active:scale-[0.98]"
                  >
                    <div className="w-12 h-12 bg-slate-800 rounded-xl overflow-hidden shadow-inner">
                      <img src={gen.url} alt="work" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium truncate max-w-[150px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{gen.prompt}</h4>
                      <p className="text-slate-500 text-xs">{gen.time}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setGenImage(gen.url);
                        setGenPrompt(gen.prompt);
                        setCurrentView('generator');
                      }}
                      className="p-2 text-slate-500 hover:text-blue-400"
                    >
                      <Layout size={18} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Generator View */}
        {currentView === 'generator' && (
          <motion.div
            key="generator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pb-32 px-6 pt-16 relative z-10"
          >
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setCurrentView('dashboard')} className="p-2 glass rounded-xl">
                <ChevronRight size={20} className="rotate-180" />
              </button>
              <h2 className="text-2xl font-bold">Generation</h2>
            </div>

            <div className={`aspect-[3/4] w-full glass rounded-[40px] mb-8 relative overflow-hidden flex items-center justify-center border transition-all ${isDarkMode ? 'border-white/5 bg-slate-900/50' : 'border-slate-200 bg-slate-100'}`}>
              <AnimatePresence mode="wait">
                {isGenerating || (genImage && isImageLoading) ? (
                  <motion.div 
                    key="generating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                        borderRadius: ["20%", "50%", "20%"]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="w-16 h-16 bg-blue-500/20 border-2 border-blue-500/50 mx-auto mb-6 flex items-center justify-center"
                    >
                      <Sparkles className="text-blue-400" size={24} />
                    </motion.div>
                    <p className="text-blue-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                      {isGenerating ? "Refining Masterpiece..." : "Painting canvas..."}
                    </p>
                  </motion.div>
                ) : genImage ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 group"
                  >
                    <img 
                      src={genImage} 
                      alt="Generated AI" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onLoad={() => setIsImageLoading(false)}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={saveToRecent}
                        className="px-6 py-3 bg-blue-600 rounded-2xl text-white font-bold shadow-xl shadow-blue-900/60 flex items-center gap-2 active:scale-95 transition-transform"
                      >
                        <ShieldCheck size={20} /> Save Work
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="placeholder" className="text-center p-8">
                    <ImageIcon size={48} className="mx-auto mb-4 text-zinc-700" />
                    <p className="text-zinc-500 font-medium tracking-tight">Enter a prompt below to begin</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={`rounded-[32px] p-6 mb-4 border transition-all ${isDarkMode ? 'glass-dark border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
              <textarea 
                placeholder="Describe what you want to see..."
                value={genPrompt}
                onChange={(e) => setGenPrompt(e.target.value)}
                className={`w-full bg-transparent border-none outline-none text-lg resize-none h-24 font-medium transition-colors ${isDarkMode ? 'placeholder:text-zinc-700 text-white' : 'placeholder:text-slate-300 text-slate-900'}`}
              />
              <div className={`flex items-center justify-between border-t pt-4 mt-2 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="flex gap-2">
                  <button className={`px-3 py-1 glass text-[10px] rounded-full font-bold uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>4K</button>
                  <button className={`px-3 py-1 glass text-[10px] rounded-full font-bold uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Pro</button>
                </div>
                <button 
                  onClick={handleGenerateImage}
                  disabled={isGenerating || !genPrompt.trim()}
                  className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-600/30 active:scale-90 transition-all disabled:opacity-50"
                >
                  {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={20} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Chat View */}
        {currentView === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`h-screen flex flex-col pt-16 px-6 relative z-10 transition-all duration-500 ease-in-out ${isFullScreen ? 'pb-8' : 'pb-32'}`}
          >
            {/* Custom Background */}
            {chatBackground && (
              <div 
                className="absolute inset-0 z-[-1] pointer-events-none"
                style={{ 
                  backgroundImage: `url(${chatBackground})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: bgOpacity
                }}
              />
            )}
            <div className={`flex items-center justify-between mb-6 transition-all duration-300 ${isFullScreen ? 'opacity-0 -translate-y-10 pointer-events-none h-0 mb-0' : 'opacity-100 translate-y-0'}`}>
              <div className="flex items-center gap-4">
                <button onClick={() => setCurrentView('dashboard')} className="p-2 glass rounded-xl">
                  <ChevronRight size={20} className="rotate-180" />
                </button>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  KBot Assistant <Bot size={20} className="text-blue-400" />
                </h2>
              </div>
            </div>

            {/* Floating Fullscreen Toggle */}
            <button 
              onClick={() => setIsFullScreen(!isFullScreen)}
              className={`fixed top-16 right-6 z-50 p-3 glass rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${isFullScreen ? 'text-blue-400 shadow-lg shadow-blue-500/20' : 'text-slate-500'}`}
            >
              {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide py-4">
              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-3xl ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : isDarkMode ? 'glass-dark border-white/5 rounded-tl-none' : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                  }`}>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.attachments.map((att, i) => (
                          <div key={i} className="relative group">
                            {att.type === 'image' ? (
                              <img src={att.url} alt="attachment" className="w-32 h-32 object-cover rounded-xl border border-white/10" />
                            ) : (
                              <div className="w-32 h-32 bg-slate-900 rounded-xl flex items-center justify-center border border-white/10 relative">
                                <Video size={24} className="text-white/50" />
                                <span className="absolute bottom-1 right-2 text-[8px] text-white/50 truncate max-w-full px-1">{att.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
              {isTyping && messages[messages.length - 1].text === "" && (
                <ThinkingIndicator isDarkMode={isDarkMode} />
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input & Suggestions Container */}
            <motion.div 
              layout
              className="relative mt-4 flex flex-col"
            >
              {/* Suggestions */}
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {[
                  "Create a 4K neon wallpaper",
                  "Suggest minimalist UI colors",
                  "How to build a glassmorphic card?",
                  "Draft a short poetic caption"
                ].map((text, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setInputMessage(text)}
                    className={`whitespace-nowrap px-4 py-2 glass rounded-2xl text-[11px] font-bold border transition-colors ${
                      isDarkMode ? 'text-slate-400 border-white/5 hover:text-blue-400' : 'text-slate-500 border-slate-200 hover:text-blue-600 bg-white shadow-sm'
                    }`}
                  >
                    {text}
                  </motion.button>
                ))}
              </div>

              {/* Attachment Previews */}
              {attachments.length > 0 && (
                <div className="flex gap-2 mb-2 overflow-x-auto py-2 scrollbar-hide">
                  {attachments.map((att, i) => (
                    <div key={i} className="relative flex-shrink-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden glass border border-white/10">
                        {att.type === 'image' ? (
                          <img src={att.url} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900">
                            <Video size={16} />
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => removeAttachment(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white scale-75 shadow-lg"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className={`p-2 rounded-[32px] flex items-center gap-2 border transition-all ${isDarkMode ? 'glass-dark border-white/5' : 'bg-white border-slate-200 shadow-lg shadow-blue-900/5'}`}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleFileSelect(e, 'image')} 
                />
                <input 
                  type="file" 
                  ref={videoInputRef} 
                  className="hidden" 
                  accept="video/*" 
                  onChange={(e) => handleFileSelect(e, 'video')} 
                />
                
                <div className="flex gap-1 ml-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-500 hover:text-blue-400 transition-colors"
                  >
                    <ImageIcon size={18} />
                  </button>
                  <button 
                    onClick={() => videoInputRef.current?.click()}
                    className="p-2 text-slate-500 hover:text-blue-400 transition-colors"
                  >
                    <Video size={18} />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Ask KBot anything..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-medium"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isTyping || (!inputMessage.trim() && attachments.length === 0)}
                  className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-600/30 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Settings View */}
        {currentView === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pb-32 px-6 pt-16 relative z-10"
          >
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setCurrentView('dashboard')} className="p-2 glass rounded-xl">
                <ChevronRight size={20} className="rotate-180" />
              </button>
              <h2 className="text-2xl font-bold">Settings</h2>
            </div>

            <div className="space-y-6">
              {/* Theme Section */}
              <GlassCard className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-100 text-orange-600'}`}>
                    {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Appearance</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{isDarkMode ? 'Dark' : 'Light'} Mode</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isDarkMode ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <motion.div 
                    animate={{ x: isDarkMode ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </GlassCard>

              {/* Chat Customization */}
              <div className="space-y-4">
                <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon size={12} /> Chat Customization
                </h3>
                <GlassCard className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                      <ImageIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Chat Background</h3>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                        {chatBackground ? 'Custom Image Set' : 'Default Background'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {chatBackground && (
                      <button 
                        onClick={() => setChatBackground(null)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Reset Background"
                      >
                        <X size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => backgroundImageInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 rounded-xl text-xs font-bold text-white shadow-lg shadow-blue-900/40"
                    >
                      Change
                    </button>
                    <input 
                      type="file" 
                      ref={backgroundImageInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => handleFileSelect(e, 'background')} 
                    />
                  </div>
                </GlassCard>
                {chatBackground && (
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Background Opacity</span>
                        <span className="text-xs font-mono text-blue-500 font-bold">{Math.round(bgOpacity * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.01" 
                        max="1" 
                        step="0.01" 
                        value={bgOpacity} 
                        onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    <div className={`relative aspect-video w-full rounded-2xl overflow-hidden glass border mx-auto max-w-[200px] ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                      <img 
                        src={chatBackground} 
                        alt="Current Background" 
                        className="w-full h-full object-cover" 
                        style={{ opacity: bgOpacity }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat History Section */}
              <div>
                <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <History size={12} /> Session Chat History
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                  {messages.length <= 1 ? (
                    <div className={`p-6 rounded-3xl text-center italic text-xs border ${isDarkMode ? 'glass border-white/5 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                      No active conversation history.
                    </div>
                  ) : (
                    messages.filter(m => m.text).map((msg, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i} 
                        className="glass p-4 rounded-2xl flex gap-3 items-start border-white/5 bg-white/5"
                      >
                        <div className={`mt-1 p-1.5 rounded-lg ${msg.role === 'user' ? 'bg-blue-600/20 text-blue-400' : 'bg-indigo-600/20 text-indigo-400'}`}>
                          {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">{msg.role === 'user' ? 'You' : 'KBot'}</p>
                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{msg.text}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Account etc */}
              <GlassCard className="flex items-center gap-4 opacity-70">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                  <ShieldCheck size={20} />
                </div>
                <div className="flex-1 font-bold text-sm">Privacy & Security</div>
                <ChevronRight size={18} className="text-zinc-600" />
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* Profile View */}
        {currentView === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pb-32 px-6 pt-16 relative z-10"
          >
            <div className="flex flex-col items-center mb-12">
              <div className="w-32 h-32 rounded-full border-2 border-blue-500/50 p-1 mb-4">
                <img src="https://i.pravatar.cc/300?u=alex" alt="profile" className="w-full h-full rounded-full object-cover" />
              </div>
              <h2 className="text-3xl font-display font-bold">Alex Rivera</h2>
              <p className="text-blue-400 font-medium">Pro Creator</p>
            </div>

            <div className="space-y-4">
              <GlassCard className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center"><CreditCard size={20} /></div>
                <div className="flex-1 font-bold">Subscription</div>
                <ChevronRight size={18} className="text-zinc-600" />
              </GlassCard>
              <GlassCard className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center"><Settings size={20} /></div>
                <div className="flex-1 font-bold">App Settings</div>
                <ChevronRight size={18} className="text-zinc-600" />
              </GlassCard>
              <button 
                onClick={() => setCurrentView('login')}
                className="w-full h-14 rounded-2xl bg-red-500/10 text-red-400 font-bold mt-4"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: (currentView === 'chat' && isFullScreen) ? 150 : 0 }}
        className={`fixed bottom-8 left-6 right-6 h-20 glass rounded-[28px] flex items-center justify-around px-12 z-50 shadow-2xl transition-all duration-500 border-t ${isDarkMode ? 'border-white/5 shadow-black/40' : 'border-white/50 shadow-blue-900/5'}`}
      >
        <div onClick={() => setCurrentView('dashboard')} className="flex flex-col items-center gap-1 cursor-pointer group">
          <div className={`p-2 rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-blue-500 shadow-lg shadow-blue-500/40 text-white' : isDarkMode ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'}`}>
            <Layout size={20} />
          </div>
          <span className={`text-[10px] font-bold ${currentView === 'dashboard' ? 'text-blue-400' : 'text-slate-500'}`}>Home</span>
        </div>
        <div onClick={() => setCurrentView('chat')} className="flex flex-col items-center gap-1 cursor-pointer group">
          <div className={`p-2 rounded-xl transition-all ${currentView === 'chat' ? 'bg-blue-500 shadow-lg shadow-blue-500/40 text-white' : isDarkMode ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'}`}>
            <MessageSquare size={20} />
          </div>
          <span className={`text-[10px] font-bold ${currentView === 'chat' ? 'text-blue-400' : 'text-slate-500'}`}>Chat</span>
        </div>
        <div onClick={() => setCurrentView('settings')} className="flex flex-col items-center gap-1 cursor-pointer group">
          <div className={`p-2 rounded-xl transition-all ${currentView === 'settings' ? 'bg-blue-500 shadow-lg shadow-blue-500/40 text-white' : isDarkMode ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'}`}>
            <Settings size={20} />
          </div>
          <span className={`text-[10px] font-bold ${currentView === 'settings' ? 'text-blue-400' : 'text-slate-500'}`}>Settings</span>
        </div>
      </motion.div>
      <div className={`fixed bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full z-50 ${isDarkMode ? 'bg-white/20' : 'bg-slate-900/10'}`}></div>
    </div>
  );
}
