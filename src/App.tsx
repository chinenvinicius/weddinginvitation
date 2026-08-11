/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, MapPin, Calendar, Languages } from 'lucide-react';

// Components
import BackgroundMusic from './components/BackgroundMusic';
import BurgerMenu from './components/BurgerMenu';
import EnvelopeIntro from './components/EnvelopeIntro';
import InvitationCover from './components/InvitationCover';
import PhotoGallery from './components/PhotoGallery';
import WeddingGuestbook from './components/WeddingGuestbook';
import SponsorsSec from './components/SponsorsSec';
import WeddingParty from './components/WeddingParty';
import CeremonyRoles from './components/CeremonyRoles';
import VenueLocation from './components/VenueLocation';
import DetailsSec from './components/DetailsSec';
import { I18nContext, Language, languages, translations } from './i18n';

export default function App() {
  const parameters = new URLSearchParams(window.location.search);
  const guestbookMode = parameters.has('guestbook');
  const adminMode = parameters.get('admin') === '1';
  const [language, setLanguage] = useState<Language>('en');
  const [guestbookOpen, setGuestbookOpen] = useState(false);
  const t = translations[language];
  // References to scroll down from the hero CTA
  const detailsRef = useRef<HTMLDivElement | null>(null);
  // Envelope opening state — gates the reveal of the invitation card
  const [opened, setOpened] = useState(() => {
    return guestbookMode || adminMode;
  });

  useEffect(() => {
    document.documentElement.lang = languages.find((item) => item.code === language)?.htmlLang ?? 'en';
  }, [language]);

  useEffect(() => {
    if (guestbookMode || adminMode) return;
    fetch('/api/schedule', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((schedule: { submissionsOpen?: boolean }) => setGuestbookOpen(Boolean(schedule.submissionsOpen)))
      .catch(() => setGuestbookOpen(false));
  }, [guestbookMode, adminMode]);

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    if (!parameters.has('guestbook') && parameters.get('admin') !== '1') return;
    const timer = window.setTimeout(() => document.getElementById('section-guestbook')?.scrollIntoView(), 50);
    return () => window.clearTimeout(timer);
  }, []);

  const scrollToDetails = () => {
    detailsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { id: 'section-cover', label: t.navCover },
    { id: 'section-gallery', label: t.navGallery },
    ...(guestbookOpen ? [{ id: 'section-guestbook', label: 'Share a memory' }] : []),
    { id: 'section-sponsors', label: t.navSponsors },
    { id: 'section-entourage', label: t.navEntourage },
    { id: 'section-ceremony', label: t.navCeremony },
    { id: 'section-location', label: t.navVenue },
    { id: 'section-details', label: t.navDetails },
    { id: 'admin', label: 'Admin' },
  ];

  if (guestbookMode || adminMode) {
    return (
      <I18nContext.Provider value={{ language, t }}>
        <WeddingGuestbook />
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ language, t }}>
    <div
      id="wedding-invite-app"
      className="min-h-screen bg-[#FDFDFB] text-sage-900 font-sans selection:bg-sage-200 selection:text-sage-800 antialiased overflow-x-hidden relative"
    >
      
      {/* Full App Subtle Watercolor Paper Texture Background Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-repeat pointer-events-none opacity-[0.05] mix-blend-multiply z-0" 
        style={{ backgroundImage: 'url("/photos/d.webp")' }} 
      />

      {/* 1. Header / Navigation Initials Indicator (Centered Minimalist Aesthetic, No heavy sidebars/menus) */}
      <header className="fixed top-0 inset-x-0 h-16 bg-white/40 backdrop-blur-md z-45 border-b border-sage-150/20 flex items-center justify-between gap-3 px-4 sm:px-12 select-none">
        <span className="hidden sm:inline font-montserrat text-[10px] tracking-[0.3em] font-bold text-sage-600 uppercase">
          Vinicius & Irish
        </span>
        <div className="flex items-center gap-1">
          <span className="font-script text-3xl text-sage-800">V</span>
          <Heart className="w-3 h-3 text-sage-400 fill-sage-300 animate-pulse" />
          <span className="font-script text-3xl text-sage-800">T</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline font-montserrat text-[9px] tracking-widest text-[#A38E7E] font-medium">
            {t.headerDate}
          </span>
          <BurgerMenu items={navItems} />
          <div className="flex items-center gap-1 rounded-full bg-white/65 border border-sage-200/70 px-1.5 py-1 shadow-sm">
            <Languages className="w-3.5 h-3.5 text-sage-500 ml-1" aria-hidden="true" />
            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => setLanguage(item.code)}
                className={`min-w-8 rounded-full px-2 py-1 font-montserrat text-[9px] font-bold tracking-wider transition-all cursor-pointer ${
                  language === item.code
                    ? 'bg-sage-600 text-white shadow-sm'
                    : 'text-sage-600 hover:text-sage-900'
                }`}
                aria-pressed={language === item.code}
                aria-label={`Switch language to ${item.label}`}
                title={item.label}
              >
                {item.shortLabel}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Gently falling flower petals overlay */}
      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
        {['🌹','🌺','🌷','🌼','🌻','💐'].map((petal, i) => (
          <span
            key={i}
            className="petal-fall absolute text-xl opacity-60"
            style={{ left: `${8 + i * 16}%`, animationDelay: `${i * 2.5}s`, animationDuration: `${11 + i * 2}s` }}
          >
            {petal}
          </span>
        ))}
      </div>

      {/* Decorative Padding Top to account for floating header */}
      <div className="h-16" />

      {/* Envelope opening overlay — shown until the user opens the invitation */}
      <AnimatePresence>
        {!opened ? (
          <EnvelopeIntro onOpen={() => setOpened(true)} />
        ) : null}
      </AnimatePresence>

      {/* 2. Invitation Main Cover (Slide 1) */}
      <section id="section-cover">
        <InvitationCover onNavigateToNext={scrollToDetails} opened={opened} />
      </section>

      {/* Visual Floral Separator Line */}
      <div className="w-full flex items-center justify-center py-6 bg-gradient-to-b from-[#F6F5F2] to-[#F3F4F1] select-none text-sage-300">
        <span className="h-px w-16 bg-sage-300/40" />
        <span className="text-lg mx-3">🌺 🌹 🌺</span>
        <span className="h-px w-16 bg-sage-300/40" />
      </div>

      {/* Anchor point for the main action scrolling */}
      <div ref={detailsRef} />

      {/* 2b. Photo Gallery (mixed-card collage) */}
      <section id="section-gallery">
        <PhotoGallery />
      </section>

      {/* QR-only private message form plus the approved public wedding wall */}
      <WeddingGuestbook />

      {/* Visual Floral Separator Line */}
      <div className="w-full flex items-center justify-center py-6 bg-gradient-to-b from-[#F3F4F1] to-[#F3F4F1] select-none text-sage-300">
        <span className="h-px w-16 bg-sage-300/40" />
        <span className="text-lg mx-3">🌼 🌷 🌼</span>
        <span className="h-px w-16 bg-sage-300/40" />
      </div>

      {/* 3. Parents & Sponsors Slide (Slide 2) */}
      <section id="section-sponsors" className="relative group">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <SponsorsSec />
        </motion.div>
      </section>

      {/* Visual Floral Separator Line */}
      <div className="w-full flex items-center justify-center py-6 bg-gradient-to-b from-[#E7ECE6] to-[#E7ECE6] select-none text-sage-300">
        <span className="h-px w-16 bg-sage-300/30" />
        <span className="text-lg mx-3">🌿 🌹 🌿</span>
        <span className="h-px w-16 bg-sage-300/30" />
      </div>

      {/* 4. Wedding Party Entourage (Slides 3, 4, 5) */}
      <section id="section-entourage">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <WeddingParty />
        </motion.div>
      </section>

      {/* Visual Floral Separator Line */}
      <div className="w-full flex items-center justify-center py-6 bg-gradient-to-b from-[#FAF9F5] to-[#FAF9F5] select-none text-sage-300">
        <span className="h-px w-16 bg-sage-300/40" />
        <span className="text-lg mx-3">🌷 💐 🌷</span>
        <span className="h-px w-16 bg-sage-300/40" />
      </div>

      {/* 5. Ceremony timelines and Program Roles (Slide 6) */}
      <section id="section-ceremony">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <CeremonyRoles />
        </motion.div>
      </section>

      {/* Visual Floral Separator Line */}
      <div className="w-full flex items-center justify-center py-6 bg-gradient-to-b from-[#FAF9F5] to-[#F1F2ED] select-none text-sage-300">
        <span className="h-px w-16 bg-sage-300/30" />
        <span className="text-lg mx-3">📍</span>
        <span className="h-px w-16 bg-sage-300/30" />
      </div>

      {/* 5b. Venue Location (3D animated building) */}
      <section id="section-location">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <VenueLocation />
        </motion.div>
      </section>

      {/* Visual Floral Separator Line */}
      <div className="w-full flex items-center justify-center py-6 bg-gradient-to-b from-[#E7ECE6] to-[#FAF9F5] select-none text-sage-300">
        <span className="h-px w-16 bg-sage-300/30" />
        <span className="text-lg mx-3">🌹 💐 🌹</span>
        <span className="h-px w-16 bg-sage-300/30" />
      </div>

      {/* 6. Details, Dress Code & Registry (Slide 7) */}
      <section id="section-details">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <DetailsSec />
        </motion.div>
      </section>

      {/* 8. Elegant Footer */}
      <footer className="bg-sage-900 text-sage-100 py-16 px-6 relative border-t border-sage-800 overflow-hidden select-none">
        {/* Subtle background overlay */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-sage-800/15 rounded-full filter blur-xl pointer-events-none" />

        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6 relative z-10">
          <div className="flex items-center gap-1">
            <span className="font-script text-4xl sm:text-5xl text-sage-200">Vinicius</span>
            <span className="font-script text-5xl text-sage-400 font-light italic mx-1">&</span>
            <span className="font-script text-4xl sm:text-5xl text-sage-200">Irish</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-xs text-sage-400 font-montserrat uppercase tracking-widest mt-2">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#CBB199]" /> {t.footerDate}</span>
            <span className="hidden sm:inline text-sage-600">•</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#CBB199]" /> {t.footerLocation}</span>
          </div>

          <p className="max-w-md text-sage-400 text-xs font-serif leading-relaxed italic mt-2">
            {t.footerThanks}
          </p>

          <p className="font-montserrat text-xs font-semibold tracking-[0.12em] text-[#CBB199]">
            #VinIrishlyEverAfter
          </p>

          <hr className="w-16 border-t border-sage-800/80 my-4" />

          <p className="text-[10px] font-montserrat text-sage-500 uppercase tracking-wider">
            © 2026 Vinicius & Irish Goyo. {t.allRights}
          </p>

          <p className="text-[10px] font-montserrat text-sage-500 tracking-wider mt-3">
            Made by <span className="font-semibold text-sage-300">WebMirai社</span> — CEO (Chinen Vinicius)
          </p>
        </div>
      </footer>

      {/* 9. Floating Background Music Melodic Loop Controller */}
      <BackgroundMusic />
    </div>
    </I18nContext.Provider>
  );
}
