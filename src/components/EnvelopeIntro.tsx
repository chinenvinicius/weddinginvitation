/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useI18n } from '../i18n';

interface EnvelopeIntroProps {
  onOpen: () => void;
}

export default function EnvelopeIntro({ onOpen }: EnvelopeIntroProps) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    // Reveal the invitation card after the flap finishes opening
    const id = window.setTimeout(onOpen, 1000);
    return () => window.clearTimeout(id);
  };

  const envelopeBase = '#E9E2D2';
  const envelopeDeep = '#CBB199';
  const wax = '#5C0612';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#E7ECE6] overflow-hidden px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: mounted ? 1 : 0 }}
      transition={{ duration: 0.6 }}
      style={{ pointerEvents: opening ? 'none' : 'auto' }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url('/photos/d.jpg')` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[#E7ECE6]/55" aria-hidden="true" />

      <motion.div
        className="relative w-[min(92vw,30rem)] aspect-[3/2] cursor-pointer select-none"
        initial={{ y: 40, opacity: 0, scale: 0.9 }}
        animate={{
          y: mounted ? 0 : 40,
          opacity: mounted ? 1 : 0,
          scale: opening ? 1.08 : mounted ? 1 : 0.9,
        }}
        transition={{
          y: { duration: 0.8, ease: 'easeOut', delay: 0.2 },
          opacity: { duration: 0.6, delay: 0.2 },
          scale: { duration: opening ? 0.9 : 0.8, ease: opening ? [0.16, 1, 0.3, 1] : 'easeOut' },
        }}
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpen();
          }
        }}
        aria-label={t.coverIntro}
        style={{ perspective: 1400 }}
      >
        {/* Envelope back */}
        <div
          className="absolute inset-0 rounded-lg shadow-[0_30px_60px_-20px_rgba(61,45,32,0.45)]"
          style={{ background: `linear-gradient(135deg, ${envelopeBase}, ${envelopeDeep})` }}
        />

        {/* Bottom pocket triangle (front flap facing bottom) */}
        <div
          className="absolute inset-0 rounded-b-lg overflow-hidden"
          style={{ background: `linear-gradient(160deg, ${envelopeDeep}, ${envelopeBase})` }}
          aria-hidden="true"
        >
          <div
            className="absolute left-0 bottom-0 w-full h-full"
            style={{
              clipPath: 'polygon(0 100%, 100% 100%, 50% 42%)',
              background: 'linear-gradient(135deg, rgba(61,45,32,0.08), rgba(61,45,32,0.18))',
            }}
          />
        </div>

        {/* Side flaps */}
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            clipPath: 'polygon(0 0, 50% 55%, 0 100%)',
            background: 'linear-gradient(120deg, rgba(61,45,32,0.05), rgba(61,45,32,0.12))',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            clipPath: 'polygon(100% 0, 50% 55%, 100% 100%)',
            background: 'linear-gradient(240deg, rgba(61,45,32,0.05), rgba(61,45,32,0.12))',
          }}
          aria-hidden="true"
        />

        {/* Names peeking through — lift up as the envelope opens */}
        <motion.div
          className="absolute inset-x-0 top-[18%] flex flex-col items-center pointer-events-none"
          animate={{ y: opening ? -60 : 0, opacity: opening ? 0 : 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span className="font-serif text-[10px] sm:text-xs tracking-[0.28em] text-[#8D7A6C] uppercase">
            {t.coverIntro}
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-script text-4xl sm:text-5xl text-[#3D171A]">Vinicius</span>
            <span className="font-script text-3xl sm:text-4xl text-[#C5A059]">&</span>
            <span className="font-script text-4xl sm:text-5xl text-[#3D171A]">Irish</span>
          </div>
        </motion.div>

        {/* Wax seal — breaks away when opening */}
        <motion.div
          className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
          animate={{
            scale: opening ? 0 : 1,
            rotate: opening ? -25 : 0,
            opacity: opening ? 0 : 1,
          }}
          transition={{ duration: 0.45, ease: 'easeIn' }}
        >
          <motion.div
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
            style={{
              background: `radial-gradient(circle at 35% 30%, #81212a, ${wax} 70%)`,
              boxShadow: '0 6px 14px rgba(61,6,18,0.5), inset 0 2px 4px rgba(255,255,255,0.25), inset 0 -4px 8px rgba(0,0,0,0.35)',
            }}
            animate={opening ? {} : { scale: [1, 1.06, 1] }}
            transition={opening ? {} : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart className="w-6 h-6 text-[#F3E5E6] fill-[#F3E5E6]/85" />
          </motion.div>
        </motion.div>

        {/* Top opening flap — lifts up and back when opening */}
        <motion.div
          className="absolute inset-x-0 top-0 origin-top rounded-t-lg z-30"
          style={{
            height: '55%',
            background: `linear-gradient(180deg, ${envelopeDeep}, ${envelopeBase})`,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            boxShadow: '0 4px 10px rgba(61,45,32,0.15)',
          }}
          initial={{ rotateX: 0 }}
          animate={{ rotateX: opening ? -175 : mounted ? 0 : 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Hint label */}
        <motion.div
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: opening ? 0 : [0, 1, 0.6, 1] }}
          transition={opening ? { duration: 0.3 } : { duration: 1.8, repeat: Infinity, delay: 1.2 }}
        >
          <span className="font-montserrat text-[10px] tracking-[0.25em] text-[#5C0612] uppercase font-bold">
            Click to open
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}