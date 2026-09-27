import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import DemoFlow from "@/components/DemoFlow";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Zap, Shield, BarChart3, MessageCircle } from "lucide-react";

const features = [
  { icon: Zap, title: "Smart Routing", desc: "AI automatically assigns tickets to the right technician" },
  { icon: Shield, title: "SLA Tracking", desc: "Real-time SLA monitoring with automatic escalation" },
  { icon: BarChart3, title: "Analytics", desc: "Deep insights into your support operations" },
  { icon: MessageCircle, title: "AI Assistant", desc: "Intelligent chatbot for instant help" },
];

const Index = () => {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen gradient-dark relative overflow-hidden">
      {/* Complex Tech Background Image Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base Layer - Dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        
        {/* Hexagonal Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0L93.3 25v50L50 100 6.7 75V25z' fill='none' stroke='%23fb923c' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px',
            backgroundPosition: '0 0'
          }}
        />

        {/* Diagonal Tech Lines */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(251, 146, 60)" stopOpacity="0" />
                <stop offset="50%" stopColor="rgb(251, 146, 60)" stopOpacity="1" />
                <stop offset="100%" stopColor="rgb(251, 146, 60)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="0" x2="100%" y2="100%" stroke="url(#lineGrad)" strokeWidth="2" />
            <line x1="20%" y1="0" x2="0" y2="100%" stroke="url(#lineGrad)" strokeWidth="1" />
            <line x1="100%" y1="0" x2="80%" y2="100%" stroke="url(#lineGrad)" strokeWidth="1" />
          </svg>
        </div>

        {/* Network Node Connections - Tech Infrastructure Visual */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            {/* Nodes */}
            <circle cx="10%" cy="20%" r="4" fill="rgb(251, 146, 60)" />
            <circle cx="25%" cy="15%" r="3" fill="rgb(251, 146, 60)" />
            <circle cx="40%" cy="25%" r="5" fill="rgb(251, 146, 60)" />
            <circle cx="60%" cy="18%" r="3" fill="rgb(251, 146, 60)" />
            <circle cx="75%" cy="30%" r="4" fill="rgb(251, 146, 60)" />
            <circle cx="90%" cy="22%" r="3" fill="rgb(251, 146, 60)" />
            
            <circle cx="15%" cy="80%" r="3" fill="rgb(251, 146, 60)" />
            <circle cx="35%" cy="75%" r="4" fill="rgb(251, 146, 60)" />
            <circle cx="55%" cy="85%" r="3" fill="rgb(251, 146, 60)" />
            <circle cx="80%" cy="78%" r="5" fill="rgb(251, 146, 60)" />
            
            {/* Connection Lines */}
            <line x1="10%" y1="20%" x2="25%" y2="15%" stroke="rgb(251, 146, 60)" strokeWidth="1" strokeOpacity="0.4" />
            <line x1="25%" y1="15%" x2="40%" y2="25%" stroke="rgb(251, 146, 60)" strokeWidth="1" strokeOpacity="0.4" />
            <line x1="40%" y1="25%" x2="60%" y2="18%" stroke="rgb(251, 146, 60)" strokeWidth="1" strokeOpacity="0.4" />
            <line x1="60%" y1="18%" x2="75%" y2="30%" stroke="rgb(251, 146, 60)" strokeWidth="1" strokeOpacity="0.4" />
            <line x1="75%" y1="30%" x2="90%" y2="22%" stroke="rgb(251, 146, 60)" strokeWidth="1" strokeOpacity="0.4" />
            
            <line x1="15%" y1="80%" x2="35%" y2="75%" stroke="rgb(251, 146, 60)" strokeWidth="1" strokeOpacity="0.4" />
            <line x1="35%" y1="75%" x2="55%" y2="85%" stroke="rgb(251, 146, 60)" strokeWidth="1" strokeOpacity="0.4" />
            <line x1="55%" y1="85%" x2="80%" y2="78%" stroke="rgb(251, 146, 60)" strokeWidth="1" strokeOpacity="0.4" />
            
            {/* Vertical connections */}
            <line x1="40%" y1="25%" x2="35%" y2="75%" stroke="rgb(251, 146, 60)" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="5,5" />
            <line x1="75%" y1="30%" x2="80%" y2="78%" stroke="rgb(251, 146, 60)" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="5,5" />
          </svg>
        </div>

        {/* Animated Gradient Orbs - Much More Prominent */}
        <motion.div 
          className="absolute top-20 left-[10%] w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251, 146, 60, 0.25) 0%, rgba(251, 146, 60, 0.1) 40%, transparent 70%)'
          }}
          animate={{
            x: [0, 80, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-10 right-[5%] w-[700px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251, 146, 60, 0.2) 0%, rgba(249, 115, 22, 0.15) 35%, transparent 65%)'
          }}
          animate={{
            x: [0, -60, 0],
            y: [0, -70, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-[40%] right-[20%] w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(234, 88, 12, 0.18) 0%, rgba(251, 146, 60, 0.08) 45%, transparent 70%)'
          }}
          animate={{
            x: [0, 70, 0],
            y: [0, -60, 0],
            scale: [1, 1.25, 1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Data Stream Lines - Animated */}
        <motion.div 
          className="hidden lg:block absolute right-[10%] top-[10%] w-[2px] h-[300px] opacity-30"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgb(251, 146, 60), transparent)'
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            height: ['200px', '400px', '200px']
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="hidden lg:block absolute left-[15%] bottom-[15%] w-[300px] h-[2px] opacity-30"
          style={{
            background: 'linear-gradient(to right, transparent, rgb(251, 146, 60), transparent)'
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            width: ['200px', '400px', '200px']
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        {/* Server/IT Icons Pattern - Hidden on Mobile */}
        <div className="hidden md:block absolute inset-0 opacity-5">
          <div className="absolute top-[15%] left-[8%] w-12 h-12 border-2 border-orange-500 rounded-lg" />
          <div className="absolute top-[25%] right-[12%] w-16 h-16 border-2 border-orange-400 rounded-lg" />
          <div className="absolute bottom-[20%] left-[15%] w-14 h-14 border-2 border-orange-500 rounded-lg" />
          <div className="absolute bottom-[30%] right-[20%] w-10 h-10 border-2 border-orange-400 rounded-lg" />
        </div>

        {/* Subtle Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(251, 146, 60, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(251, 146, 60, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            backgroundPosition: 'center center'
          }}
        />

        {/* Vignette Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-transparent to-slate-950/30" />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
        <BrandLogo size="md" />
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate("/login")}
            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 sm:px-4 py-2"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="gradient-primary text-primary-foreground text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl glow-orange hover:opacity-90 transition-opacity"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 md:pt-24 pb-12 sm:pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-tight mb-4 sm:mb-6 px-4 sm:px-0">
            Smarter IT Support
            <br />
            <span className="text-gradient">Starts Here</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 px-4 sm:px-6">
            ThinkAuto uses AI to automate ticket routing, predict issues, and accelerate resolution — so your team can focus on what matters.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <button
              onClick={() => navigate("/signup")}
              className="w-full sm:w-auto gradient-primary text-primary-foreground font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl glow-orange hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg"
            >
              Start Free Trial <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
            <button
              onClick={() => setDemoOpen(true)}
              className="w-full sm:w-auto glass text-foreground font-medium px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl hover:bg-secondary/50 transition-all text-sm sm:text-base backdrop-blur-xl border border-border/50"
            >
              Watch Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 pb-16 sm:pb-20">
        {/* Mobile: infinite auto-scrolling marquee. sm+: normal padded grid */}
        <div className="feature-flow-wrapper sm:max-w-6xl sm:mx-auto sm:px-6">
          <div className="feature-flow">
            {/* Original cards */}
            {features.map((feature, i) => (
              <div key={feature.title} className="feature-flow-item">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{ y: -7, scale: 1.015 }}
                  className="feature-card glass rounded-2xl p-5 sm:p-6 group backdrop-blur-xl border border-border/50"
                >
                  <div className="feature-step" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="gradient-primary rounded-xl p-2.5 w-fit mb-3 sm:mb-4 group-hover:glow-orange transition-all shadow-lg">
                    <feature.icon className="w-4 sm:w-5 h-4 sm:h-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-1 text-sm sm:text-base">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{feature.desc}</p>
                </motion.div>

                {i < features.length - 1 && (
                  <div className="feature-connector" aria-hidden="true">
                    <div className="feature-connector-track">
                      <span className="feature-connector-pulse" />
                    </div>
                    <ArrowRight className="feature-arrow feature-arrow-right" />
                    <ArrowDown className="feature-arrow feature-arrow-down" />
                  </div>
                )}
              </div>
            ))}
            {/* Duplicate cards for seamless infinite loop (mobile only, hidden from screen readers) */}
            {features.map((feature, i) => (
              <div key={`clone-${feature.title}`} className="feature-flow-item" aria-hidden="true">
                <div className="feature-card glass rounded-2xl p-5 group backdrop-blur-xl border border-border/50">
                  <div className="feature-step">{String(i + 1).padStart(2, "0")}</div>
                  <div className="gradient-primary rounded-xl p-2.5 w-fit mb-3 group-hover:glow-orange transition-all shadow-lg">
                    <feature.icon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-1 text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DemoFlow
        open={demoOpen}
        onOpenChange={setDemoOpen}
        onGetStarted={() => {
          setDemoOpen(false);
          navigate("/signup");
        }}
      />
    </div>
  );
};

export default Index;
