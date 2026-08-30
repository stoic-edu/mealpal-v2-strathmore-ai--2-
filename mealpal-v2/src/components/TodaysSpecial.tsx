import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, UtensilsCrossed } from "lucide-react";
import { culturalSpecials } from "@/lib/mock-data";

export function TodaysSpecial() {
  const [index, setIndex] = useState(0);

  // Default to today's cultural special if it's a weekday match, otherwise start at 0
  useEffect(() => {
    const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const match = culturalSpecials.findIndex((s) => s.day === dayName);
    if (match >= 0) setIndex(match);
  }, []);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % culturalSpecials.length);
  }, []);

  const prev = () => {
    setIndex((i) => (i - 1 + culturalSpecials.length) % culturalSpecials.length);
  };

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const special = culturalSpecials[index];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border h-48">
      <Image src={special.image} alt={special.cuisine} fill className="object-cover" priority={index === 0} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-primary/90 text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
        <UtensilsCrossed className="w-3 h-3" />
        {special.day} Special
      </div>

      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
        aria-label="Previous special"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
        aria-label="Next special"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-serif font-bold text-lg leading-tight">{special.cuisine}</h3>
        <p className="text-white/80 text-xs mt-0.5">{special.description}</p>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {special.items.map((item) => (
            <span key={item} className="text-[10px] font-medium bg-white/15 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-2 right-3 flex gap-1">
        {culturalSpecials.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === index ? "bg-white w-4" : "bg-white/40"}`}
            aria-label={`Go to ${s.day}`}
          />
        ))}
      </div>
    </div>
  );
}
