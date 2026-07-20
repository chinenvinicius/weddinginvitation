/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useI18n } from '../i18n';

interface BurgerMenuProps {
  items: { id: string; label: string }[];
}

export default function BurgerMenu({ items }: BurgerMenuProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.menuOpen}
        aria-expanded={open}
        aria-controls="wedding-nav-menu"
        className="flex items-center justify-center w-9 h-9 rounded-full bg-white/65 border border-sage-200/70 text-sage-700 hover:bg-white hover:text-sage-900 shadow-sm transition-all cursor-pointer"
      >
        {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-sage-900/20 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.nav
              id="wedding-nav-menu"
              className="absolute right-0 top-12 z-50 w-60 rounded-2xl bg-white/95 backdrop-blur-md border border-sage-150/60 shadow-[0_18px_40px_-12px_rgba(45,60,45,0.35)] overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              role="menu"
            >
              <ul className="py-2">
                {items.map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => go(item.id)}
                      className="w-full text-left px-4 py-2.5 font-montserrat text-[11px] tracking-[0.18em] uppercase font-semibold text-sage-700 hover:bg-sage-100 hover:text-sage-900 transition-colors cursor-pointer"
                    >
                      {item.label}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}