/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Search, Heart, User, Users, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { groomParents, brideParents, principalSponsors, secondarySponsors } from '../data';
import { useI18n } from '../i18n';

export default function SponsorsSec() {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');

  // Sorter / filter helper for search query
  const filteredSponsors = principalSponsors.filter(sponsor => 
    sponsor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F3F4F1] to-[#E7ECE6] overflow-hidden">
      {/* Decorative floral backgrounds - watercolor wash */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
      <div className="absolute -top-10 -left-10 w-48 sm:w-72 h-48 sm:h-72 select-none opacity-20 hover:opacity-30 transition-all pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-sage-400">
          <circle cx="20" cy="20" r="30" fill="currentColor" opacity="0.15" />
          <path d="M0 0 Q 30 50, 80 10" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3"/>
        </svg>
      </div>

      <div className="w-full max-w-5xl bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white/80 p-6 sm:p-10 lg:p-12 shadow-xl relative z-10 overflow-hidden">
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
        
        {/* Custom Section Title */}
        <div className="text-center mb-10 relative z-10">
          <span className="text-xs uppercase tracking-[0.3em] font-montserrat font-semibold text-sage-500">{t.honorary}</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-sage-800 font-bold tracking-wide mt-1">{t.parentsSponsors}</h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="h-px w-8 bg-sage-300" />
            <Heart className="w-3.5 h-3.5 text-sage-400 fill-sage-200" />
            <span className="h-px w-8 bg-sage-300" />
          </div>
        </div>

        {/* 1. Parents Section (Exactly matching layout: PARENT'S GROOM & PARENT'S BRIDE) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative z-10">
          {/* Groom Parents */}
          <div className="bg-white/40 p-6 rounded-2xl border border-sage-100 text-center relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#CBB199]/40" />
            <h3 className="font-montserrat text-xs tracking-[0.25em] text-[#8D7A6C] font-bold uppercase mb-4 flex items-center justify-center gap-2">
              <Users className="w-3.5 h-3.5" />
              {t.groomParents}
            </h3>
            <div className="flex flex-col gap-2">
              {groomParents.map((parent, idx) => (
                <p key={idx} className="font-serif italic text-lg sm:text-xl text-[#8D7A6C] tracking-wide leading-relaxed font-medium">
                  {parent.name}
                </p>
              ))}
            </div>
          </div>

          {/* Bride Parents */}
          <div className="bg-white/40 p-6 rounded-2xl border border-sage-100 text-center relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#CBB199]/40" />
            <h3 className="font-montserrat text-xs tracking-[0.25em] text-[#8D7A6C] font-bold uppercase mb-4 flex items-center justify-center gap-2">
              <Users className="w-3.5 h-3.5" />
              {t.brideParents}
            </h3>
            <div className="flex flex-col gap-2">
              {brideParents.map((parent, idx) => (
                <p key={idx} className="font-serif italic text-lg sm:text-xl text-[#8D7A6C] tracking-wide leading-relaxed font-medium">
                  {parent.name}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Search Tool for Principal Sponsors (Luxury details) */}
        <div className="mb-8 w-full max-w-lg mx-auto relative z-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
            <input
              type="text"
              placeholder={t.searchSponsor}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/90 border border-sage-200 rounded-full text-sm font-montserrat text-sage-700 placeholder-sage-400/80 focus:outline-none focus:ring-1 focus:ring-sage-400 shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-sage-500 hover:text-sage-800 uppercase tracking-widest cursor-pointer"
              >
                {t.clear}
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-center text-[11px] font-montserrat text-sage-600/80 mt-1.5 animate-pulse">
              {t.foundSponsors(filteredSponsors.length)}
            </p>
          )}
        </div>

        {/* 2. Principal Sponsors Section */}
        <div className="bg-white/40 p-6 sm:p-8 rounded-[2rem] border border-sage-100 shadow-sm mb-12 relative z-10">
          <h3 className="font-montserrat text-sm tracking-[0.3em] text-[#5C705D] font-bold uppercase text-center mb-8 flex items-center justify-center gap-2 select-none">
            <Star className="w-4 h-4 text-[#CBB199] fill-[#CBB199]" />
            {t.principalSponsors}
            <Star className="w-4 h-4 text-[#CBB199] fill-[#CBB199]" />
          </h3>

          <div className="flex flex-col md:flex-row items-stretch justify-center relative gap-y-6 md:gap-y-0">
            {/* Left Column (1-15) */}
            <div className="flex-1 space-y-3.5 md:pr-8">
              {principalSponsors.slice(0, 15).map((sponsor, i) => {
                const isHighlighted = searchQuery !== '' && sponsor.name.toLowerCase().includes(searchQuery.toLowerCase());
                const isAnySearching = searchQuery !== '';

                return (
                  <div 
                    key={i}
                    className={`flex items-baseline gap-3 transition-all duration-300 ${
                      isHighlighted 
                        ? 'bg-[#CBB199]/15 text-sage-900 font-medium scale-[1.02] px-3 py-1 rounded-lg border border-[#CBB199]/20 shadow-sm' 
                        : isAnySearching 
                          ? 'opacity-30 scale-95' 
                          : 'hover:translate-x-1'
                    }`}
                  >
                    <span className="font-montserrat text-xs tracking-wider text-[#A38E7E] font-medium w-6 text-right select-none">
                      {sponsor.number}.
                    </span>
                    <span className="font-serif italic text-base sm:text-lg text-sage-850 tracking-wide font-medium">
                      {sponsor.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Middle Divider Line with Diamond Ornament */}
            <div className="hidden md:flex flex-col items-center justify-center relative px-4">
              <div className="w-[1px] bg-[#D1C7BD]/55 h-full absolute inset-y-0" />
              {/* Rotating diamond ornament */}
              <div className="z-10 bg-white/90 p-0.5 text-[#C4B29E] transform rotate-45 border border-[#D1C7BD]/60 w-2.5 h-2.5" />
            </div>

            {/* Right Column (16-30) */}
            <div className="flex-1 space-y-3.5 md:pl-8">
              {principalSponsors.slice(15, 30).map((sponsor, i) => {
                const isHighlighted = searchQuery !== '' && sponsor.name.toLowerCase().includes(searchQuery.toLowerCase());
                const isAnySearching = searchQuery !== '';

                return (
                  <div 
                    key={i}
                    className={`flex items-baseline gap-3 transition-all duration-300 ${
                      isHighlighted 
                        ? 'bg-[#CBB199]/15 text-sage-900 font-medium scale-[1.02] px-3 py-1 rounded-lg border border-[#CBB199]/20 shadow-sm' 
                        : isAnySearching 
                          ? 'opacity-30 scale-95' 
                          : 'hover:translate-x-1'
                    }`}
                  >
                    <span className="font-montserrat text-xs tracking-wider text-[#A38E7E] font-medium w-6 text-right select-none">
                      {sponsor.number}.
                    </span>
                    <span className="font-serif italic text-base sm:text-lg text-sage-850 tracking-wide font-medium">
                      {sponsor.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Secondary Sponsors Section */}
        <div className="bg-[#CBB199]/10 rounded-2xl border border-[#CBB199]/20 p-6 sm:p-8 text-center relative overflow-hidden z-10">
          <h3 className="font-montserrat text-xs tracking-[0.3em] text-[#8D7A6C] font-bold uppercase mb-6 flex items-center justify-center gap-2">
            {t.secondarySponsors}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Matron of Honor */}
            <div className="flex flex-col gap-1">
              <span className="font-montserrat text-[10px] tracking-widest uppercase text-sage-600 font-bold">{t.matronOfHonor}</span>
              <p className="font-serif italic text-xl sm:text-2xl text-[#8D7A6C] tracking-wide font-medium mt-1.5">
                {secondarySponsors.matronOfHonor}
              </p>
            </div>
            {/* Best Man */}
            <div className="flex flex-col gap-1 md:border-l md:border-sage-300/30">
              <span className="font-montserrat text-[10px] tracking-widest uppercase text-sage-600 font-bold">{t.bestMan}</span>
              <p className="font-serif italic text-xl sm:text-2xl text-[#8D7A6C] tracking-wide font-medium mt-1.5">
                {secondarySponsors.bestMan}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
