/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { MapPin, Move3d } from 'lucide-react';
import { initVenue3D } from '../3d-map';
import { useI18n } from '../i18n';

const MAP_URL = 'https://www.google.com/maps/search/?api=1&query=Aeru+Kikugawa+Cultural+Hall+Shizuoka';

export default function VenueLocation() {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const dispose = initVenue3D(containerRef.current);
    return () => dispose?.();
  }, []);

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center py-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F1F2ED] to-[#E7ECE6] overflow-hidden">

      <div className="w-full max-w-5xl relative z-10">

        {/* Title */}
        <div className="text-center mb-8 select-none">
          <span className="text-xs uppercase tracking-[0.3em] font-montserrat font-semibold text-sage-500">{t.venueKicker}</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-sage-800 font-bold tracking-wide mt-1">{t.venueTitle}</h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="h-px w-6 bg-sage-300" />
            <MapPin className="w-3.5 h-3.5 text-sage-400" />
            <span className="h-px w-6 bg-sage-300" />
          </div>
        </div>

        {/* 3D animated venue building */}
        <div className="relative rounded-[2rem] overflow-hidden border border-[#C5A059]/40 shadow-[0_24px_60px_-20px_rgba(71,88,72,0.45)] bg-[#bcd6ee]">
          <div ref={containerRef} className="w-full h-[min(62vh,520px)] cursor-grab active:cursor-grabbing" />

          {/* Drag hint */}
          <span className="absolute top-4 right-4 flex items-center gap-1.5 text-[11px] tracking-wider text-white bg-[#5C0612]/55 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none select-none">
            <Move3d className="w-3.5 h-3.5" /> {t.dragHint}
          </span>

          {/* Venue card overlay */}
          <div className="absolute left-3 right-3 sm:left-5 sm:right-auto bottom-3 sm:bottom-5 sm:max-w-xs bg-[#FAF9F5]/90 backdrop-blur-md border border-[#C5A059]/40 rounded-2xl p-4 sm:p-5 shadow-xl text-left">
            <p className="font-serif text-lg sm:text-xl text-[#5C0612] font-bold leading-tight">Aeru Kikugawa Cultural Hall</p>
            <p className="font-montserrat text-[11px] text-sage-600 tracking-wide mt-1.5 leading-relaxed">
              2488-2 Honjo, Kikugawa<br />Shizuoka 439-0018, Japan
            </p>
            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 bg-[#8D7A6C] text-white px-4 py-2 rounded-full font-montserrat text-[10px] tracking-widest font-semibold uppercase hover:bg-[#70645A] transition-all hover:-translate-y-0.5 shadow-md"
            >
              <MapPin className="w-3.5 h-3.5" /> {t.getDirections}
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
