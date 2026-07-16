/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Gift, Paintbrush } from 'lucide-react';
import { dressCodeColorsGown, dressCodeColorsSuit } from '../data';
import { useI18n } from '../i18n';

export default function DetailsSec() {
  const { t } = useI18n();

  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAF9F5] to-[#F1F2ED] overflow-hidden">
      
      {/* Decorative vector arches */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-white to-transparent pointer-events-none" />

      <div className="w-full max-w-5xl bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white/80 p-5 sm:p-10 lg:p-12 shadow-xl relative z-10 overflow-hidden">
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
        <div className="text-center mb-10 relative z-10">
          <span className="text-xs uppercase tracking-[0.3em] font-montserrat font-semibold text-sage-500">{t.detailsKicker}</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-sage-800 font-bold tracking-wide mt-1">{t.detailsTitle}</h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="h-px w-6 bg-sage-300" />
            <Paintbrush className="w-3.5 h-3.5 text-sage-400 fill-sage-100" />
            <span className="h-px w-6 bg-sage-300" />
          </div>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch relative z-10">
          
          {/* Left Block (Lg: Col-7) - Clean Dress Code Swatches */}
          <div className="lg:col-span-7 bg-white/45 p-6 sm:p-8 rounded-3xl border border-sage-100/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-sage-100/50 pb-4 mb-6 select-none">
                <div>
                  <h3 className="font-montserrat text-xs tracking-widest text-[#8D7A6C] font-bold uppercase">
                    {t.attireTitle}
                  </h3>
                  <p className="text-[10px] text-sage-500 font-montserrat mt-0.5">{t.attireSub}</p>
                </div>
                <span className="text-sm">🧥👗</span>
              </div>

              <p className="font-serif text-sage-700 text-sm sm:text-base leading-relaxed mb-8 text-center sm:text-left">
                {t.attireText}
              </p>

              {/* Color selectors */}
              <div className="space-y-8">
                {/* Sage Green Gown Palette */}
                <div className="space-y-4">
                  <span className="font-montserrat text-[10px] tracking-widest uppercase font-bold text-sage-600 flex items-center gap-1.5">
                    🌿 {t.sagePalette}
                  </span>
                  
                  <div className="flex h-12 w-full rounded-lg overflow-hidden shadow-md border border-sage-200/20">
                    {dressCodeColorsGown.map((color) => (
                      <div
                        key={color.hex}
                        style={{ backgroundColor: color.hex }}
                        className="flex-1 h-full first:rounded-l-lg last:rounded-r-lg border-r last:border-r-0 border-white/20 relative group/swatch transition-transform duration-300 hover:scale-[1.03] hover:z-10 cursor-pointer"
                        title={color.name}
                      >
                        {/* Tooltip to display name and hex code */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/swatch:flex flex-col items-center z-30 pointer-events-none">
                          <div className="bg-sage-900 text-white text-[9px] tracking-wider font-montserrat uppercase font-semibold py-1 px-2.5 rounded shadow-lg whitespace-nowrap">
                            {color.name} ({color.hex})
                          </div>
                          <div className="w-1.5 h-1.5 bg-sage-900 rotate-45 -mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Burgundy Suit Palette */}
                <div className="space-y-4 pt-4 border-t border-sage-100/45">
                  <span className="font-montserrat text-[10px] tracking-widest uppercase font-bold text-sage-600 flex items-center gap-1.5">
                    🍷 {t.winePalette}
                  </span>
                  
                  <div className="flex h-12 w-full rounded-lg overflow-hidden shadow-md border border-sage-200/20">
                    {dressCodeColorsSuit.map((color) => (
                      <div
                        key={color.hex}
                        style={{ backgroundColor: color.hex }}
                        className="flex-1 h-full first:rounded-l-lg last:rounded-r-lg border-r last:border-r-0 border-white/20 relative group/swatch transition-transform duration-300 hover:scale-[1.03] hover:z-10 cursor-pointer"
                        title={color.name}
                      >
                        {/* Tooltip to display name and hex code */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/swatch:flex flex-col items-center z-30 pointer-events-none">
                          <div className="bg-sage-900 text-white text-[9px] tracking-wider font-montserrat uppercase font-semibold py-1 px-2.5 rounded shadow-lg whitespace-nowrap">
                            {color.name} ({color.hex})
                          </div>
                          <div className="w-1.5 h-1.5 bg-sage-900 rotate-45 -mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Block (Lg: Col-5) - Notice on Gifts */}
          <div className="lg:col-span-5 bg-white/45 p-6 sm:p-8 rounded-3xl border border-sage-100/60 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden min-h-[300px]">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#CBB199]" />
            
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#CBB199]/10 flex items-center justify-center text-[#A38E7E] mb-5 border border-[#CBB199]/20 shadow-inner">
                <Gift className="w-7 h-7" />
              </div>

              <h3 className="font-montserrat text-xs tracking-widest text-[#8D7A6C] font-bold uppercase mb-4 select-none">
                {t.giftsTitle}
              </h3>

              <div className="space-y-4 max-w-sm">
                <p className="font-serif text-sage-800 text-base sm:text-lg leading-relaxed">
                  {t.giftsText1}
                </p>
                <p className="font-serif text-sage-600/90 text-sm sm:text-base leading-relaxed italic">
                  {t.giftsText2}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
