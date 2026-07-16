/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck, Award, Star, Mic, Music2, MapPin, Sparkles } from 'lucide-react';
import { programRoles } from '../data';
import { useI18n } from '../i18n';

export default function CeremonyRoles() {
  const { t } = useI18n();

  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F1F2ED] to-[#FAF9F5] overflow-hidden">
      
      {/* Decorative SVG floral line art */}
      <div className="absolute left-1/2 -translate-x-1/2 top-4 w-96 h-96 pointer-events-none opacity-[0.03] select-none">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-sage-950">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 5 Q 50 50, 95 50" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 5 Q 50 50, 5 50" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="w-full max-w-2xl bg-white/75 backdrop-blur-md rounded-[2.5rem] border border-white/90 p-6 sm:p-10 shadow-xl relative z-10 overflow-hidden">
        {/* Floral corner frames */}
        <img
          src="/floral-frame.webp"
          alt=""
          aria-hidden="true"
          className="absolute -top-32 -right-36 w-60 sm:w-80 md:w-96 opacity-[0.85] pointer-events-none select-none z-0 drop-shadow-[0_12px_18px_rgba(61,23,26,0.1)]"
        />
        <img
          src="/floral-frame.webp"
          alt=""
          aria-hidden="true"
          className="absolute -bottom-36 -left-36 w-60 sm:w-80 md:w-96 rotate-180 opacity-[0.85] pointer-events-none select-none z-0 drop-shadow-[0_12px_18px_rgba(61,23,26,0.1)]"
        />
        
        {/* Title */}
        <div className="text-center mb-10 relative z-10 flex flex-col items-center">
          <span className="font-script text-5xl sm:text-6xl text-[#3D171A] leading-none mb-1 select-none">
            {t.ceremonyTitleScript}
          </span>
          <span className="font-serif text-xs tracking-widest text-[#C5A059] uppercase block mb-1 font-semibold select-none">
            {t.and}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-sage-800 font-bold tracking-widest uppercase mt-1 select-none">
            {t.programRolesTitleSerif}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3.5 select-none">
            <span className="h-[0.5px] w-12 bg-[#C4B29E]/50" />
            <span className="text-[10px] text-[#C4B29E]">❖</span>
            <span className="h-[0.5px] w-12 bg-[#C4B29E]/50" />
          </div>
        </div>

        {/* Roles Stack */}
        <div className="flex flex-col items-center text-center space-y-8 relative z-10 w-full max-w-lg mx-auto">
          
          {/* Officiating Minister */}
          <div className="flex flex-col items-center">
            <span className="font-montserrat text-xs tracking-[0.25em] text-[#8D7A6C] font-bold uppercase select-none">
              {t.officiatingMinister}
            </span>
            <div className="flex items-center gap-2 mt-1 mb-2 select-none">
              <span className="h-[0.5px] w-5 bg-[#C4B29E]/30" />
              <span className="text-[6px] text-[#C4B29E]">❖</span>
              <span className="h-[0.5px] w-5 bg-[#C4B29E]/30" />
            </div>
            <p className="font-serif italic text-base sm:text-lg text-sage-850 tracking-wide font-medium">
              {programRoles.officiatingMinister}
            </p>
          </div>

          <span className="text-[8px] text-[#C5A059] select-none">✦</span>

          {/* Emcee */}
          <div className="flex flex-col items-center">
            <span className="font-montserrat text-xs tracking-[0.25em] text-[#8D7A6C] font-bold uppercase select-none">
              {t.emcee}
            </span>
            <div className="flex items-center gap-2 mt-1 mb-2 select-none">
              <span className="h-[0.5px] w-5 bg-[#C4B29E]/30" />
              <span className="text-[6px] text-[#C4B29E]">❖</span>
              <span className="h-[0.5px] w-5 bg-[#C4B29E]/30" />
            </div>
            <p className="font-serif italic text-base sm:text-lg text-sage-850 tracking-wide font-medium">
              {programRoles.emcee}
            </p>
          </div>

          <span className="text-[8px] text-[#C5A059] select-none">✦</span>

          {/* Singer */}
          <div className="flex flex-col items-center">
            <span className="font-montserrat text-xs tracking-[0.25em] text-[#8D7A6C] font-bold uppercase select-none">
              {t.singer}
            </span>
            <div className="flex items-center gap-2 mt-1 mb-2 select-none">
              <span className="h-[0.5px] w-5 bg-[#C4B29E]/30" />
              <span className="text-[6px] text-[#C4B29E]">❖</span>
              <span className="h-[0.5px] w-5 bg-[#C4B29E]/30" />
            </div>
            <div className="flex flex-col items-center gap-0.5">
              {programRoles.singers.map((name) => (
                <p key={name} className="font-serif italic text-base sm:text-lg text-sage-850 tracking-wide font-medium">
                  {name}
                </p>
              ))}
            </div>
          </div>

          <span className="text-[8px] text-[#C5A059] select-none">✦</span>

          {/* Program Coordinator */}
          <div className="flex flex-col items-center">
            <span className="font-montserrat text-xs tracking-[0.25em] text-[#8D7A6C] font-bold uppercase select-none">
              {t.programCoordinator}
            </span>
            <div className="flex items-center gap-2 mt-1 mb-2 select-none">
              <span className="h-[0.5px] w-5 bg-[#C4B29E]/30" />
              <span className="text-[6px] text-[#C4B29E]">❖</span>
              <span className="h-[0.5px] w-5 bg-[#C4B29E]/30" />
            </div>
            <p className="font-serif italic text-base sm:text-lg text-sage-850 tracking-wide font-medium">
              {programRoles.programCoordinator}
            </p>
          </div>

          <span className="text-[8px] text-[#C5A059] select-none">✦</span>

          {/* Usherettes */}
          <div className="flex flex-col items-center">
            <span className="font-montserrat text-xs tracking-[0.25em] text-[#8D7A6C] font-bold uppercase select-none">
              {t.usherettes}
            </span>
            <div className="flex items-center gap-2 mt-1 mb-2.5 select-none">
              <span className="h-[0.5px] w-6 bg-[#C4B29E]/30" />
              <span className="text-[6px] text-[#C4B29E]">❖</span>
              <span className="h-[0.5px] w-6 bg-[#C4B29E]/30" />
            </div>
            <div className="space-y-1.5">
              {programRoles.usherettes.map((name, i) => (
                <p key={i} className="font-serif italic text-base sm:text-lg text-sage-850 tracking-wide font-medium leading-relaxed">
                  {i + 1}. {name}
                </p>
              ))}
            </div>
          </div>

        </div>

        {/* Dynamic wax seal with ribbon wave centered */}
        <div className="relative flex flex-col items-center justify-center mt-10 mb-2 w-full py-4 select-none z-10">
          {/* Horizontal Velvet Ribbon Wave */}
          <svg viewBox="0 0 400 60" className="absolute w-80 sm:w-96 h-12 text-[#560c1b]/95 pointer-events-none drop-shadow-md z-0" fill="currentColor">
            <path d="M 20 30 C 50 10, 100 50, 150 30 C 180 20, 190 20, 200 20 C 210 20, 220 20, 250 30 C 300 50, 350 10, 380 30 L 375 35 C 345 15, 295 55, 250 35 C 220 25, 210 25, 200 25 C 190 25, 180 25, 150 35 C 100 55, 50 15, 25 35 Z" />
          </svg>

          {/* Wax Seal centered on top of ribbon */}
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#7C1328] to-[#560c1b] shadow-lg border border-[#7C1328]/35 flex items-center justify-center ring-4 ring-[#7C1328]/15 z-10 animate-pulse-slow">
            {/* Inner ring */}
            <div className="absolute inset-2 rounded-full border border-dashed border-[#560c1b]/35 shadow-inner" />
            
            {/* Monogram */}
            <span className="font-script text-2xl text-[#CBB199] font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              V&I
            </span>
          </div>
        </div>

        {/* Heart Divider bottom */}
        <div className="flex items-center justify-center gap-2 mt-6 select-none relative z-10">
          <span className="h-[0.5px] w-16 bg-[#C4B29E]/50" />
          <span className="text-[10px] text-[#C4B29E]">♥</span>
          <span className="h-[0.5px] w-16 bg-[#C4B29E]/50" />
        </div>

      </div>
    </div>
  );
}
