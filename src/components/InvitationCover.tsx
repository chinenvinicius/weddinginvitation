/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, ChevronDown } from 'lucide-react';
import { useI18n } from '../i18n';

interface InvitationCoverProps {
  onNavigateToNext: () => void;
  opened: boolean;
}

export default function InvitationCover({ onNavigateToNext, opened }: InvitationCoverProps) {
  const { t } = useI18n();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Target date: Wednesday, August 12, 2026
    const targetDate = new Date('August 12, 2026 13:30:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference < 0) {
        clearInterval(interval);
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[96vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#E7ECE6] overflow-hidden">
      
      {/* Visible hero background image with a soft tint for readable foreground content */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-55"
        style={{ backgroundImage: `url('/photos/d.jpg')` }}
      />
      <div className="absolute inset-0 bg-[#E7ECE6]/45 pointer-events-none" />

      {/* 1. Ambient Background Watercolor Splotches */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#E4ECE3]/35 rounded-full filter blur-[120px] pointer-events-none select-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#F3E5E6]/30 rounded-full filter blur-[100px] pointer-events-none select-none" />
      <div className="absolute top-[30%] left-[20%] w-[35%] h-[35%] bg-[#FAF2E8]/40 rounded-full filter blur-[90px] pointer-events-none select-none" />

      {/* 2. Main Card Container (The Elegant Invitation Canvas — real paper stock look) */}
      <motion.div
        className="w-full max-w-5xl bg-transparent backdrop-blur-[2px] rounded-[2.5rem] shadow-[0_1px_2px_rgba(61,45,32,0.10),0_10px_22px_-10px_rgba(71,88,72,0.30),0_45px_90px_-30px_rgba(71,88,72,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] border border-[#E9E2D2]/40 relative overflow-hidden p-6 sm:p-10 md:p-12"
        initial={{ opacity: 0, y: 80, scale: 0.92, rotateX: 25 }}
        animate={opened ? { opacity: 1, y: 0, scale: 1, rotateX: 0 } : { opacity: 0, y: 80, scale: 0.92, rotateX: 25 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: opened ? 0.15 : 0 }}
        style={{ transformOrigin: 'top center', transformPerspective: 1200 }}
      >
        {/* Paper fiber grain */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none opacity-[0.2] mix-blend-multiply"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.93 0 0 0 0 0.90 0 0 0 0 0.84 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23p)'/%3E%3C/svg%3E")` }}
        />
        {/* Soft vignette so the sheet reads as slightly curved, not flat-printed */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none"
          style={{ background: 'radial-gradient(ellipse at 50% 38%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%, rgba(120,105,85,0.05) 100%)' }}
        />
        <img
          src="/floral-frame.webp"
          alt=""
          aria-hidden="true"
          className="absolute -top-24 -right-28 w-72 sm:w-[27rem] md:w-[32rem] opacity-95 pointer-events-none select-none z-10 drop-shadow-[0_18px_24px_rgba(61,23,26,0.16)]"
        />
        <img
          src="/floral-frame.webp"
          alt=""
          aria-hidden="true"
          className="absolute -bottom-28 -left-32 w-72 sm:w-[26rem] md:w-[31rem] rotate-180 opacity-90 pointer-events-none select-none z-10 drop-shadow-[0_18px_24px_rgba(61,23,26,0.14)]"
        />
        
        {/* Double Border Frame */}
        <div className="absolute inset-4 sm:inset-6 border border-[#D1C7BD]/45 rounded-[2rem] pointer-events-none z-10" />
        <div className="absolute inset-[1.25rem] sm:inset-[1.75rem] border border-dashed border-[#D1C7BD]/25 rounded-[1.85rem] pointer-events-none z-10" />

        {/* Vintage Gold Corner Ornaments */}
        <div className="absolute top-[2rem] left-[2rem] w-8 h-8 pointer-events-none z-20 text-[#C4B29E]/70">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" className="w-full h-full">
            <path d="M5 40 L5 5 C5 5, 40 5, 40 5" strokeLinecap="round" />
            <path d="M15 30 L15 15 C15 15, 30 15, 30 15" strokeLinecap="round" />
            <circle cx="5" cy="5" r="3" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute top-[2rem] right-[2rem] w-8 h-8 pointer-events-none z-20 text-[#C4B29E]/70 rotate-90">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" className="w-full h-full">
            <path d="M5 40 L5 5 C5 5, 40 5, 40 5" strokeLinecap="round" />
            <path d="M15 30 L15 15 C15 15, 30 15, 30 15" strokeLinecap="round" />
            <circle cx="5" cy="5" r="3" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute bottom-[2rem] left-[2rem] w-8 h-8 pointer-events-none z-20 text-[#C4B29E]/70 -rotate-90">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" className="w-full h-full">
            <path d="M5 40 L5 5 C5 5, 40 5, 40 5" strokeLinecap="round" />
            <path d="M15 30 L15 15 C15 15, 30 15, 30 15" strokeLinecap="round" />
            <circle cx="5" cy="5" r="3" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute bottom-[2rem] right-[2rem] w-8 h-8 pointer-events-none z-20 text-[#C4B29E]/70 rotate-180">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" className="w-full h-full">
            <path d="M5 40 L5 5 C5 5, 40 5, 40 5" strokeLinecap="round" />
            <path d="M15 30 L15 15 C15 15, 30 15, 30 15" strokeLinecap="round" />
            <circle cx="5" cy="5" r="3" fill="currentColor" />
          </svg>
        </div>

        {/* 3. Centered Invitation Content (photos live in the Gallery section below) */}
        <div className="relative z-20 flex justify-center">

        <div className="w-full max-w-2xl flex flex-col items-center justify-center text-center px-2 sm:px-4">
          
          {/* Top Intro Tag */}
          <span className="font-serif text-[11px] sm:text-xs tracking-[0.28em] text-[#8D7A6C] font-semibold uppercase select-none">
            {t.coverIntro}
          </span>

          {/* Delicate horizontal gold line ornament with a center diamond */}
          <div className="flex items-center gap-2 w-32 my-3 select-none">
            <span className="h-[0.5px] bg-[#C4B29E]/50 flex-grow" />
            <span className="text-[7px] text-[#C4B29E]">◆</span>
            <span className="h-[0.5px] bg-[#C4B29E]/50 flex-grow" />
          </div>

          {/* Exquisite Overlapping Calligraphy & Name Title */}
          <div className="relative w-full py-2 flex flex-col items-center select-none">
            <h1 className="font-script text-6xl sm:text-8xl md:text-[5.5rem] lg:text-[6.2rem] text-[#3D171A] leading-[1.05] tracking-wide filter drop-shadow-sm font-medium">
              Vinicius
            </h1>
            
            {/* Elegant gold ampersand with breathing room between names */}
            <span className="font-serif italic font-light text-[#C5A059] text-6xl sm:text-7xl md:text-[4.75rem] my-1 sm:my-2 opacity-80 z-10 select-none block leading-none">
              &
            </span>

            <h1 className="font-script text-6xl sm:text-8xl md:text-[5.5rem] lg:text-[6.2rem] text-[#3D171A] leading-[1.05] tracking-wide filter drop-shadow-sm font-medium">
              Irish
            </h1>
          </div>

          {/* Invitation Call Statement */}
          <div className="flex flex-col gap-0.5 mt-2 select-none">
            <span className="font-serif text-[10px] sm:text-[11px] tracking-[0.22em] text-[#8D7A6C] uppercase">
              {t.inviteLine1}
            </span>
            <span className="font-serif text-xs sm:text-sm tracking-[0.18em] text-[#5C705D] font-bold uppercase">
              {t.inviteLine2}
            </span>
          </div>

          {/* Divider line */}
          <div className="w-16 h-px bg-[#E5E2D6] my-5" />
          <div className="flex flex-col items-center gap-1.5 select-none bg-white/35 px-6 py-4 rounded-2xl border border-sage-100/50">
            <span className="font-serif text-[10px] sm:text-xs tracking-[0.25em] text-[#8D7A6C] uppercase font-semibold">
              {t.weekday}
            </span>
            
            {/* Recreated 08 | 12 | 26 Date Grid */}
            <div className="flex items-center gap-4 text-3xl sm:text-4xl font-serif text-[#3D171A] font-light py-1.5">
              <span>08</span>
              <span className="text-[#C5A059] font-light text-2xl">|</span>
              <span>12</span>
              <span className="text-[#C5A059] font-light text-2xl">|</span>
              <span>26</span>
            </div>

            <span className="font-serif text-[10px] sm:text-xs tracking-[0.2em] text-[#8D7A6C] uppercase">
              {t.time}
            </span>
          </div>

          {/* Venue & Location Block (Exactly as in Goyo scans) */}
          <div className="mt-6 flex flex-col items-center select-none">
            <h2 className="font-serif font-bold text-lg sm:text-xl text-[#5C0612] tracking-[0.16em] uppercase leading-tight">
              Aeru Kikugawa
            </h2>
            <h2 className="font-serif font-bold text-lg sm:text-xl text-[#5C0612] tracking-[0.16em] uppercase leading-tight">
              Cultural Hall
            </h2>
            <div className="mt-2.5 text-center text-[#70645A] font-montserrat text-[10px] sm:text-xs tracking-[0.12em] leading-relaxed uppercase">
              <p>2488-2 Honjo, Kikugawa</p>
              <p>Shizuoka 439-0018, Japan</p>
            </div>
          </div>

          {/* "Reception to follow" Elegant Cursive Suffix */}
          <p className="font-script text-3xl sm:text-4xl text-[#C5A059] mt-5 mb-4 select-none">
            {t.reception}
          </p>

          {/* Countdown Module (Styled exquisitely in alignment) */}
          <div className="w-full max-w-sm mt-3 bg-white/40 rounded-2xl p-3 border border-[#E5E2D6]/80 flex flex-col items-center gap-2">
            <span className="font-montserrat text-[9px] uppercase font-bold tracking-[0.18em] text-[#8D7A6C] flex items-center gap-1">
              <Heart className="w-3 h-3 fill-[#8D7A6C] animate-pulse" /> {t.countdown}
            </span>
            <div className="flex gap-4 text-center">
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-medium text-[#3D171A]">{timeLeft.days}</span>
                <span className="font-montserrat text-[8px] uppercase tracking-wider text-sage-500">{t.days}</span>
              </div>
              <span className="font-serif text-lg text-sage-400 self-center">:</span>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-medium text-[#3D171A]">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="font-montserrat text-[8px] uppercase tracking-wider text-sage-500">{t.hours}</span>
              </div>
              <span className="font-serif text-lg text-sage-400 self-center">:</span>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-medium text-[#3D171A]">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="font-montserrat text-[8px] uppercase tracking-wider text-sage-500">{t.mins}</span>
              </div>
              <span className="font-serif text-lg text-sage-400 self-center">:</span>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-medium text-[#3D171A]">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="font-montserrat text-[8px] uppercase tracking-wider text-sage-500">{t.secs}</span>
              </div>
            </div>
          </div>

          {/* Navigation Action Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={onNavigateToNext}
              className="group flex items-center gap-2 bg-[#8D7A6C] text-white px-5 py-2.5 rounded-full shadow-md hover:bg-[#70645A] transition-all font-montserrat text-[10px] tracking-widest font-semibold hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer uppercase"
            >
              {t.viewDetails}
              <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>

        </div>

        </div>

      </motion.div>
    </div>
  );
}
