/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Camera } from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '../i18n';

// Layered garden-rose + eucalyptus cluster with gradient-shaded petals for a painted, realistic look.
// `id` keeps gradient ids unique so multiple instances don't collide.
function FloralCluster({ id, className = '' }: { id: string; className?: string }) {
  const petal = 'M0 0 C-13 -6, -15 -25, 0 -33 C15 -25, 13 -6, 0 0 Z';
  const petalSm = 'M0 0 C-8 -4, -10 -17, 0 -23 C10 -17, 8 -4, 0 0 Z';
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id={`rose-${id}`} cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#c75666" />
          <stop offset="45%" stopColor="#9c1a2d" />
          <stop offset="100%" stopColor="#5c0612" />
        </radialGradient>
        <radialGradient id={`bud-${id}`} cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#e8a9b1" />
          <stop offset="100%" stopColor="#a32c39" />
        </radialGradient>
        <linearGradient id={`leaf-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b7c8b3" />
          <stop offset="100%" stopColor="#6f806f" />
        </linearGradient>
      </defs>

      {/* Eucalyptus sprigs */}
      <g stroke={`url(#leaf-${id})`} strokeWidth="1.4" fill="none" opacity="0.95">
        <path d="M30 150 C70 130, 95 95, 120 60" />
        <path d="M150 165 C120 130, 110 95, 100 60" />
      </g>
      {[
        [42, 142, -35], [58, 128, -30], [74, 114, -28], [90, 100, -25], [104, 84, -22],
        [142, 150, 30], [132, 132, 28], [122, 112, 25], [112, 92, 22],
      ].map(([x, y, r], k) => (
        <ellipse key={k} cx={x} cy={y} rx="11" ry="6.5" fill={`url(#leaf-${id})`}
          stroke="#5f6f52" strokeWidth="0.4" transform={`rotate(${r} ${x} ${y})`} opacity="0.92" />
      ))}

      {/* Small bud */}
      <g transform="translate(150 70)">
        {[0, 72, 144, 216, 288].map((deg) => (
          <path key={deg} d={petalSm} fill={`url(#bud-${id})`} transform={`rotate(${deg}) scale(0.7)`} stroke="#7d0f1d" strokeWidth="0.4" />
        ))}
        <circle r="2.5" fill="#d4af37" />
      </g>

      {/* Main garden rose */}
      <g transform="translate(95 105)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <path key={`o${deg}`} d={petal} fill={`url(#rose-${id})`} transform={`rotate(${deg})`} stroke="#5c0612" strokeWidth="0.5" />
        ))}
        {[22, 67, 112, 157, 202, 247, 292, 337].map((deg) => (
          <path key={`m${deg}`} d={petal} fill={`url(#rose-${id})`} transform={`rotate(${deg}) scale(0.72)`} stroke="#5c0612" strokeWidth="0.4" opacity="0.97" />
        ))}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <path key={`i${deg}`} d={petalSm} fill="#b3324a" transform={`rotate(${deg}) scale(0.85)`} opacity="0.9" />
        ))}
        <circle r="5" fill="#d4af37" stroke="#9c1a2d" strokeWidth="0.8" />
        <circle r="2.5" fill="#e5c158" />
      </g>
    </svg>
  );
}

// Masonry collage: images keep their natural aspect (no cropping), heights vary for a mixed look.
const photos = [
  { src: '/photos/b.jpg', alt: 'Vinicius & Irish smiling together', caption: 'In full bloom', tilt: 'sm:rotate-1' },
  { src: '/photos/c.jpg', alt: 'Vinicius & Irish by the water', caption: 'By the sea', tilt: 'sm:rotate-2' },
  { src: '/photos/e.jpg', alt: 'Vinicius & Irish together', caption: 'Just us', tilt: 'sm:-rotate-1' },
  { src: '/photos/1777939364041.jpg', alt: 'Vinicius & Irish portrait', caption: 'You & me', tilt: 'sm:-rotate-2' },
  { src: '/photos/1777939478097.jpg', alt: 'Vinicius & Irish portrait', caption: 'Forever', tilt: 'sm:rotate-1' },
  { src: '/photos/d.jpg', alt: 'Vinicius & Irish moment', caption: 'Our moment', tilt: 'sm:rotate-2' },
  { src: '/photos/1778618728657.jpg', alt: 'Vinicius & Irish portrait', caption: 'Side by side', tilt: 'sm:-rotate-1' },
  { src: '/photos/1780707507748.jpg', alt: 'Vinicius & Irish portrait', caption: 'Always', tilt: 'sm:rotate-1' },
];

export default function PhotoGallery() {
  const { t } = useI18n();

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center py-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAF8F5] via-[#F4F2EC] to-[#F3F4F1] overflow-hidden">

      {/* Ambient watercolor wash */}
      <div className="absolute top-[-8%] left-[-8%] w-[45%] h-[45%] bg-[#E4ECE3]/35 rounded-full filter blur-[110px] pointer-events-none select-none" />
      <div className="absolute bottom-[-10%] right-[-8%] w-[40%] h-[40%] bg-[#F3E5E6]/30 rounded-full filter blur-[100px] pointer-events-none select-none" />

      {/* Realistic floral clusters */}
      <FloralCluster id="tl" className="absolute -top-6 -left-8 w-40 sm:w-64 h-40 sm:h-64 z-0 pointer-events-none select-none drop-shadow-md animate-float-gentle" />
      <FloralCluster id="br" className="absolute -bottom-8 -right-10 w-44 sm:w-72 h-44 sm:h-72 z-0 pointer-events-none select-none drop-shadow-md rotate-180 animate-float-gentle" />

      <div className="w-full max-w-5xl relative z-10">

        {/* Title */}
        <div className="text-center mb-10 select-none">
          <span className="text-xs uppercase tracking-[0.3em] font-montserrat font-semibold text-sage-500">{t.galleryKicker}</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-sage-800 font-bold tracking-wide mt-1">{t.galleryTitle}</h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="h-px w-6 bg-sage-300" />
            <Camera className="w-3.5 h-3.5 text-sage-400" />
            <span className="h-px w-6 bg-sage-300" />
          </div>
        </div>

        {/* Masonry collage (images shown in full, no cropping) */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-5 [&>*]:mb-4 sm:[&>*]:mb-5">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.src}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className={`group relative break-inside-avoid bg-white p-2.5 pb-11 rounded-md shadow-[0_18px_40px_-15px_rgba(71,88,72,0.4)] ring-1 ring-black/5 ${photo.tilt} hover:rotate-0 hover:-translate-y-1.5 hover:shadow-[0_28px_55px_-18px_rgba(71,88,72,0.55)] transition-all duration-500`}
            >
              <div className="relative overflow-hidden rounded-sm ring-1 ring-[#C5A059]/30">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-auto block transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
              </div>
              <p className="absolute bottom-2.5 inset-x-0 text-center font-script text-xl text-[#5C705D] select-none">
                {t.photoCaptions[i] ?? photo.caption}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
