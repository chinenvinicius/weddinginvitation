/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';
import { useI18n } from '../i18n';

export default function BackgroundMusic() {
  const { t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Elegant royalty-free acoustic background piano music
    const audioUrl = 'https://assets.mixkit.co/music/preview/mixkit-delicate-piano-734.mp3';
    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.volume = 0.35; // Soft volume
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.warn('Playback blocked by browser audio policy:', error);
          // Gently show that a gesture is required
          setIsSupported(false);
          setTimeout(() => setIsSupported(true), 3000);
        });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {isPlaying && (
        <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-sage-200/50 shadow-md text-xs font-montserrat text-sage-700 tracking-wider flex items-center gap-1.5 scale-90 sm:scale-100 origin-right transition-all">
          <span className="flex gap-0.5 items-end h-3 w-4">
            <span className="w-0.5 bg-sage-500 rounded-full animate-[pulse_0.6s_infinite_alternate_200ms]" style={{ height: '60%' }} />
            <span className="w-0.5 bg-sage-500 rounded-full animate-[pulse_0.8s_infinite_alternate_400ms]" style={{ height: '90%' }} />
            <span className="w-0.5 bg-sage-500 rounded-full animate-[pulse_0.5s_infinite_alternate_100ms]" style={{ height: '40%' }} />
            <span className="w-0.5 bg-sage-500 rounded-full animate-[pulse_0.7s_infinite_alternate_300ms]" style={{ height: '100%' }} />
          </span>
          <span>{t.playingMusic}</span>
        </div>
      )}
      
      <button
        type="button"
        onClick={togglePlayback}
        className={`p-3.5 rounded-full shadow-lg border backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${
          isPlaying
            ? 'bg-sage-600 text-white border-sage-700 hover:bg-sage-700'
            : 'bg-white text-sage-600 border-sage-200 hover:border-sage-300'
        }`}
        title={isPlaying ? t.muteMusic : t.playMusic}
        aria-label={isPlaying ? t.muteMusic : t.playMusic}
      >
        {isPlaying ? (
          <Volume2 className="w-5 h-5 animate-pulse" />
        ) : (
          <VolumeX className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {!isSupported && (
        <div className="absolute bottom-16 right-0 bg-red-50 border border-red-200 px-4 py-2 rounded-lg text-xs font-montserrat text-red-700 shadow-md whitespace-nowrap">
          {t.enableAudio}
        </div>
      )}
    </div>
  );
}
