/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sparkles, Star, MessageSquare, Heart, ShieldAlert, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { weddingParty, childEntourageAndBearers } from '../data';
import { useI18n } from '../i18n';

export default function WeddingParty() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'adults' | 'children_bearers'>('adults');

  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E7ECE6] to-[#F1F2ED] overflow-hidden">
      
      {/* Background floral flourishes */}
      <div className="absolute right-0 top-1/4 w-32 sm:w-56 h-32 sm:h-56 select-none opacity-20 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-sage-400 rotate-90">
          <path d="M50 0 C70 30, 90 20, 100 50 C80 80, 50 100, 30 70 Z" fill="currentColor" opacity="0.3"/>
        </svg>
      </div>

      <div className="w-full max-w-5xl bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white/80 p-5 sm:p-10 shadow-xl relative z-10 overflow-hidden">
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
        <div className="text-center mb-8 relative z-10">
          <span className="text-xs uppercase tracking-[0.3em] font-montserrat font-semibold text-sage-500">{t.witnesses}</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-sage-800 font-bold tracking-wide mt-1">
            {activeTab === 'adults' ? t.ourWeddingParty : t.bridalEntourage}
          </h2>
          <p className="font-serif text-sage-600/90 text-sm italic mt-1.5">
            {t.entourageQuote}
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="h-px w-6 bg-sage-300" />
            <Sparkles className="w-3.5 h-3.5 text-sage-400 fill-sage-100" />
            <span className="h-px w-6 bg-sage-300" />
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-8 relative z-10">
          <div className="flex flex-wrap justify-center gap-1.5 p-1.5 bg-sage-100/55 rounded-3xl sm:rounded-full border border-sage-200/40 max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('adults')}
              className={`px-4 sm:px-5 py-2 rounded-full text-[10px] sm:text-xs font-montserrat tracking-wider sm:tracking-widest font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === 'adults'
                  ? 'bg-sage-600 text-white shadow-sm'
                  : 'text-sage-600 hover:text-sage-800'
              }`}
            >
              {t.adultsTab}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('children_bearers')}
              className={`px-4 sm:px-5 py-2 rounded-full text-[10px] sm:text-xs font-montserrat tracking-wider sm:tracking-widest font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === 'children_bearers'
                  ? 'bg-sage-600 text-white shadow-sm'
                  : 'text-sage-600 hover:text-sage-800'
              }`}
            >
              {t.childrenTab}
            </button>
          </div>
        </div>

        {/* Tab Content Panels with Micro-Animations */}
        <AnimatePresence mode="wait">
          {activeTab === 'adults' ? (
            <motion.div
              key="adults"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-10 relative z-10 w-full max-w-4xl mx-auto px-2 sm:px-6 md:px-8 py-2"
            >
              {/* Bridesmaids & Groomsmen Symmetrical Layout */}
              <div className="flex flex-col md:flex-row items-stretch justify-center relative gap-y-8 md:gap-y-0">
                {/* Bridesmaids Column */}
                <div className="flex-1 md:pr-10 flex flex-col items-center text-center">
                  <h3 className="font-montserrat text-xs tracking-[0.25em] text-[#8D7A6C] font-bold uppercase select-none">
                    {t.bridesmaid}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 mb-4 select-none">
                    <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                    <span className="text-[8px] text-[#C4B29E]">❖</span>
                    <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                  </div>
                  <div className="space-y-2">
                    {weddingParty.bridesmaids.map((name, idx) => (
                      <p key={idx} className="font-serif italic text-base sm:text-lg text-sage-850 tracking-wide font-medium leading-relaxed">
                        {idx + 1}. {name}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Vertical Divider Line with Diamond Ornament */}
                <div className="hidden md:flex flex-col items-center justify-center relative px-2">
                  <div className="w-[1px] bg-[#D1C7BD]/55 h-full absolute inset-y-0" />
                  {/* Rotating diamond ornament */}
                  <div className="z-10 bg-white/90 p-0.5 text-[#C4B29E] transform rotate-45 border border-[#D1C7BD]/60 w-2.5 h-2.5" />
                </div>

                {/* Groomsmen Column */}
                <div className="flex-1 md:pl-10 flex flex-col items-center text-center">
                  <h3 className="font-montserrat text-xs tracking-[0.25em] text-[#8D7A6C] font-bold uppercase select-none">
                    {t.groomsmen}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 mb-4 select-none">
                    <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                    <span className="text-[8px] text-[#C4B29E]">❖</span>
                    <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                  </div>
                  <div className="space-y-2">
                    {weddingParty.groomsmen.map((name, idx) => (
                      <p key={idx} className="font-serif italic text-base sm:text-lg text-sage-850 tracking-wide font-medium leading-relaxed">
                        {idx + 1}. {name}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Centered Flower Maidens Section */}
              <div className="flex flex-col items-center mt-10 pt-6 border-t border-[#D1C7BD]/25 w-full">
                <div className="flex flex-col items-center text-center">
                  <h3 className="font-montserrat text-xs tracking-[0.25em] text-[#8D7A6C] font-bold uppercase select-none">
                    {t.flowerMaiden}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 mb-4 select-none">
                    <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                    <span className="text-[8px] text-[#C4B29E]">❖</span>
                    <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                  </div>
                  <div className="space-y-2">
                    {weddingParty.flowerMaidens.map((name, idx) => (
                      <p key={idx} className="font-serif italic text-base sm:text-lg text-sage-850 tracking-wide font-medium leading-relaxed">
                        {idx + 1}. {name}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Classic Monogram Wax Seal with ribbon/tassel */}
                <div className="flex flex-col items-center mt-10 select-none">
                  {/* Seal outer container with organic pressed wax border */}
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#7C1328] to-[#560c1b] shadow-lg border border-[#7C1328]/30 flex items-center justify-center ring-4 ring-[#7C1328]/15 animate-pulse-slow">
                    {/* Pressed inner dashed ring */}
                    <div className="absolute inset-2.5 rounded-full border border-dashed border-[#560c1b]/35 shadow-inner" />
                    
                    {/* Embossed script initials */}
                    <span className="font-script text-3xl text-[#CBB199] font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                      V&I
                    </span>
                  </div>
                  
                  {/* Gold tassel */}
                  <div className="w-1.5 h-6 bg-gradient-to-b from-[#CBB199] to-[#A38E7E] shadow-sm -mt-0.5 rounded-b-md" />
                  <div className="w-3.5 h-3.5 bg-gradient-to-br from-[#CBB199] to-[#8D7A6C] rounded-full shadow-inner -mt-1 border border-[#CBB199]/20" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="children"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 relative z-10 w-full max-w-4xl mx-auto px-2 sm:px-6 md:px-8 py-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 sm:gap-x-16 gap-y-8 md:gap-y-12 items-start">
                
                {/* Left Column */}
                <div className="space-y-8 sm:space-y-10">
                  {/* Flower Girls */}
                  <div className="flex flex-col items-center text-center">
                    <h3 className="font-montserrat text-xs tracking-[0.25em] text-[#8D7A6C] font-bold uppercase select-none">
                      {t.flowerGirls}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 mb-3.5 select-none">
                      <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                      <span className="text-[8px] text-[#C4B29E]">❖</span>
                      <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                    </div>
                    <div className="space-y-2">
                      {childEntourageAndBearers.flowerGirls.map((name, idx) => (
                        <p key={idx} className="font-serif italic text-base sm:text-lg text-sage-850 tracking-wide font-medium leading-relaxed">
                          {idx + 1}. {name}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Little Bride */}
                  <div className="flex flex-col items-center text-center">
                    <h3 className="font-montserrat text-xs tracking-[0.25em] text-[#8D7A6C] font-bold uppercase select-none">
                      {t.littleBride}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 mb-3.5 select-none">
                      <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                      <span className="text-[8px] text-[#C4B29E]">❖</span>
                      <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                    </div>
                    <p className="font-serif italic text-base sm:text-lg text-sage-850 tracking-wide font-medium">
                      {childEntourageAndBearers.littleBride}
                    </p>
                  </div>

                  {/* Ring Bearer */}
                  <div className="flex flex-col items-center text-center">
                    <h3 className="font-montserrat text-xs tracking-[0.25em] text-[#8D7A6C] font-bold uppercase select-none">
                      {t.ringBearer}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 mb-3.5 select-none">
                      <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                      <span className="text-[8px] text-[#C4B29E]">❖</span>
                      <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                    </div>
                    <p className="font-serif italic text-base sm:text-lg text-sage-850 tracking-wide font-medium">
                      {childEntourageAndBearers.ringBearer}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8 sm:space-y-10">
                  {/* Escorts */}
                  <div className="flex flex-col items-center text-center">
                    <h3 className="font-montserrat text-xs tracking-[0.25em] text-[#8D7A6C] font-bold uppercase select-none">
                      {t.escorts}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 mb-3.5 select-none">
                      <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                      <span className="text-[8px] text-[#C4B29E]">❖</span>
                      <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                    </div>
                    <div className="space-y-2">
                      {childEntourageAndBearers.escorts.map((name, idx) => (
                        <p key={idx} className="font-serif italic text-base sm:text-lg text-sage-850 tracking-wide font-medium leading-relaxed">
                          {idx + 1}. {name}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Little Groom */}
                  <div className="flex flex-col items-center text-center">
                    <h3 className="font-montserrat text-xs tracking-[0.25em] text-[#8D7A6C] font-bold uppercase select-none">
                      {t.littleGroom}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 mb-3.5 select-none">
                      <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                      <span className="text-[8px] text-[#C4B29E]">❖</span>
                      <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                    </div>
                    <p className="font-serif italic text-base sm:text-lg text-sage-850 tracking-wide font-medium">
                      {childEntourageAndBearers.littleGroom}
                    </p>
                  </div>

                  {/* Bible Bearer */}
                  <div className="flex flex-col items-center text-center">
                    <h3 className="font-montserrat text-xs tracking-[0.25em] text-[#8D7A6C] font-bold uppercase select-none">
                      {t.bibleBearer}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 mb-3.5 select-none">
                      <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                      <span className="text-[8px] text-[#C4B29E]">❖</span>
                      <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                    </div>
                    <p className="font-serif italic text-base sm:text-lg text-sage-850 tracking-wide font-medium">
                      {childEntourageAndBearers.bibleBearer}
                    </p>
                  </div>
                </div>

              </div>

              {/* Bottom Centered Section */}
              <div className="flex flex-col items-center gap-8 sm:gap-10 mt-10 pt-6 border-t border-[#D1C7BD]/25 w-full">
                {/* Banner Bearers */}
                <div className="flex flex-col items-center text-center">
                  <h3 className="font-montserrat text-xs tracking-[0.25em] text-[#8D7A6C] font-bold uppercase select-none">
                    {t.bannerBearers}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 mb-3.5 select-none">
                    <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                    <span className="text-[8px] text-[#C4B29E]">❖</span>
                    <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                  </div>
                  <div className="space-y-2">
                    {childEntourageAndBearers.bannerBearers.map((name, idx) => (
                      <p key={idx} className="font-serif italic text-base sm:text-lg text-sage-850 tracking-wide font-medium leading-relaxed">
                        {idx + 1}. {name}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Candle Lighter */}
                <div className="flex flex-col items-center text-center">
                  <h3 className="font-montserrat text-xs tracking-[0.25em] text-[#8D7A6C] font-bold uppercase select-none">
                    {t.candleLighter}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 mb-3.5 select-none">
                    <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                    <span className="text-[8px] text-[#C4B29E]">❖</span>
                    <span className="h-[0.5px] w-6 bg-[#C4B29E]/50" />
                  </div>
                  <p className="font-serif italic text-base sm:text-lg text-sage-850 tracking-wide font-medium">
                    {childEntourageAndBearers.candleLighters}
                  </p>
                </div>
              </div>

              {/* Bottom Heart Flourish */}
              <div className="flex items-center justify-center gap-2.5 mt-8 select-none">
                <span className="h-[0.5px] w-20 bg-[#C4B29E]/50" />
                <span className="text-[10px] text-[#C4B29E]">♥</span>
                <span className="h-[0.5px] w-20 bg-[#C4B29E]/50" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
