import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClickOutside } from "@/hooks/use-click-outside";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

const quickQuestions = [
  "What's under KES 300?",
  "High protein meals?",
  "Vegetarian options?",
  "How long is the queue?",
  "What should I eat to lose weight?",
];

const botResponses: Record<string, string> = {
  "What's under KES 300?":
    "Here are some great options under KES 300:\n• Nasi Lemak Ayam — KES 270\n• Vegetable Curry — KES 225\n• Chicken Wrap — KES 330\n• Smoothie Bowl — KES 345\nWould you like to see more?",
  "High protein meals?":
    "High protein picks for you:\n• Grilled Chicken Rice — 42g protein\n• Salmon Teriyaki — 38g protein\n• Beef Rendang Wrap — 32g protein\n• Chicken Tikka — 45g protein\nPerfect for post-workout!",
  "Vegetarian options?":
    "Vegetarian meals available:\n• Vegetable Curry — KES 225\n• Smoothie Bowl — KES 345\n• Garden Salad — coming soon\n• Tofu Stir Fry — coming soon\nAll marked with the Vegetarian tag.",
  "How long is the queue?":
    "Current queue status:\n• Main Cafeteria — 8 min wait\n• Upesi — 3 min wait\n• Pate Cafe — 2 min wait\n• Springs of Olives — 14 min wait\nPate Cafe is your fastest option!",
  "What should I eat to lose weight?":
    "For your weight goal, I recommend:\n• Tuna Avocado Salad — 340 cal\n• Smoothie Bowl — 290 cal\n• Chicken Wrap — 480 cal\n• Vegetable Curry — 420 cal\nStay under 500 calories per meal. You've got this!",
};

function generateResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("budget") || lower.includes("ksh") || lower.includes("cheap") || lower.includes("under")) {
    return "Budget-friendly options:\n• Nasi Lemak — KES 270\n• Vegetable Curry — KES 225\n• Beef Rendang Wrap — KES 330\n• Chicken Wrap — KES 330\nSet your budget in Profile for smarter recommendations!";
  }
  if (lower.includes("protein") || lower.includes("muscle") || lower.includes("gym")) {
    return "High protein meals:\n• Grilled Chicken Rice — 42g\n• Salmon Bowl — 38g\n• Beef Wrap — 32g\n• Chicken Tikka — 45g\nGreat for muscle recovery!";
  }
  if (lower.includes("vegetarian") || lower.includes("vegan") || lower.includes("plant")) {
    return "Vegetarian options today:\n• Vegetable Curry\n• Smoothie Bowl\nAll are marked with the green Vegetarian badge.";
  }
  if (lower.includes("queue") || lower.includes("wait") || lower.includes("long")) {
    return "Queue updates:\n• Main Cafeteria — 8 min\n• Upesi — 3 min\n• Pate Cafe — 2 min\n• Springs of Olives — 14 min\nCheck the home page for live updates!";
  }
  if (lower.includes("calorie") || lower.includes("weight") || lower.includes("diet") || lower.includes("lose")) {
    return "For weight management, try meals under 450 calories:\n• Smoothie Bowl — 290 cal\n• Tuna Salad — 340 cal\n• Chicken Wrap — 480 cal\nTrack your daily calories on the home dashboard!";
  }
  if (lower.includes("allergy") || lower.includes("allergic") || lower.includes("halal")) {
    return "Your allergies are saved in your profile. I automatically filter out:\n• Meals with shellfish\n• Meals with peanuts\nLook for the allergen labels on each meal card!";
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "Hello! I'm Meal Buddy AI. I can help you:\n• Find meals under your budget\n• Check queue times\n• Get high-protein options\n• Find vegetarian food\nWhat would you like help with?";
  }
  return "I'm not sure I understand. Try asking about:\n• Meals under a budget\n• High protein options\n• Queue times\n• Vegetarian food\n• Calorie-friendly meals\nOr tap a quick question below!";
}

export function FoodChatBot() {
  const [open, setOpen] = useState(false);
  const [showCta, setShowCta] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hi there! I'm Meal Buddy AI. Need help finding the perfect meal today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  useClickOutside(wrapperRef, () => setOpen(false), open);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const reply = botResponses[text] || generateResponse(text);
      const botMsg: Message = { id: `b-${Date.now()}`, role: "bot", text: reply, timestamp: new Date() };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div ref={wrapperRef}>
      {/* Floating Button */}
      <button
        onClick={() => {
          setOpen(!open);
          setShowCta(false);
        }}
        className={`fixed bottom-24 right-4 z-50 w-16 h-16 rounded-full bg-primary shadow-xl shadow-primary/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group ${
          !open ? "animate-food-bob" : ""
        }`}
        aria-label="Chat with Meal Buddy AI"
      >
        {open ? (
          <X className="w-7 h-7 text-primary-foreground animate-spin-once" />
        ) : (
          <div className="relative w-10 h-10">
            {/* Steam particles */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1">
              <span className="w-1 h-2.5 bg-primary-foreground/80 rounded-full animate-steam-1" />
              <span className="w-1 h-3 bg-primary-foreground/60 rounded-full animate-steam-2" />
              <span className="w-1 h-2 bg-primary-foreground/70 rounded-full animate-steam-3" />
            </div>
            {/* Chef Hat / Bowl SVG */}
            <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow-sm">
              <path d="M8 28c0 8 7 14 16 14s16-6 16-14H8z" className="fill-primary-foreground" />
              <ellipse cx="24" cy="28" rx="16" ry="4" className="fill-primary-foreground/90" />
              <path d="M18 20c0-3 2-5 2-8" className="stroke-primary-foreground" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="20">
                <animate attributeName="stroke-dashoffset" values="20;0;20" dur="2.5s" repeatCount="indefinite" />
              </path>
              <path d="M24 18c0-4 2.5-6 2.5-10" className="stroke-primary-foreground" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="24">
                <animate attributeName="stroke-dashoffset" values="24;0;24" dur="3s" repeatCount="indefinite" />
              </path>
              <path d="M30 20c0-3 2-5 2-8" className="stroke-primary-foreground" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="20">
                <animate attributeName="stroke-dashoffset" values="20;0;20" dur="2.8s" repeatCount="indefinite" />
              </path>
              <circle cx="38" cy="12" r="5" className="fill-primary-foreground" />
              <circle cx="38" cy="12" r="2" className="fill-primary" />
            </svg>
          </div>
        )}
      </button>

      {/* CTA Tooltip */}
      {!open && showCta && (
        <div className="fixed bottom-24 right-[5.5rem] z-50 animate-in slide-in-from-right-3 fade-in duration-300">
          <div className="bg-card border-2 border-primary/30 shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3 max-w-[200px]">
            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse" />
            <p className="text-sm font-semibold text-foreground leading-tight">Don't know what to eat? Ask me 🍽️</p>
          </div>
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-card border-r-2 border-t-2 border-primary/30 rotate-45" />
        </div>
      )}

      {/* Chat Dialog */}
      {open && (
        <div className="fixed bottom-40 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm bg-card rounded-2xl shadow-2xl border-2 border-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="bg-primary px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary-foreground">Meal Buddy AI</p>
              <p className="text-[10px] text-primary-foreground/70 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Smart food assistant
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-primary-foreground/10">
              <X className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 max-h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "bot" ? "bg-primary/10" : "bg-muted"}`}>
                  {msg.role === "bot" ? <Bot className="w-3.5 h-3.5 text-primary" /> : <User className="w-3.5 h-3.5 text-foreground" />}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line ${msg.role === "bot" ? "bg-muted text-foreground rounded-tl-sm" : "bg-primary text-primary-foreground rounded-tr-sm"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 bg-accent/10 border-t border-accent/20">
            <p className="text-xs font-medium text-accent-foreground mb-2">Ready to order?</p>
            <Button size="sm" className="w-full h-10 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl text-sm font-semibold" onClick={() => window.location.href = "/menu"}>
              <Sparkles className="w-4 h-4 mr-2" /> Browse Full Menu
            </Button>
          </div>

          {messages.length < 3 && (
            <div className="px-4 pb-2 pt-3 flex flex-wrap gap-2">
              {quickQuestions.map((q) => (
                <button key={q} onClick={() => sendMessage(q)} className="text-xs bg-accent/20 text-accent-foreground px-3 py-1.5 rounded-full border border-accent/30 hover:bg-accent/30 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-border bg-card flex gap-2">
            <Input placeholder="Type your question..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage(input)} className="flex-1 h-10 rounded-xl text-sm bg-background border-border" />
            <Button size="icon" onClick={() => sendMessage(input)} disabled={!input.trim()} className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90">
              <Send className="w-4 h-4 text-primary-foreground" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}