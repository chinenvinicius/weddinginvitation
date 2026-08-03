import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera, Check, Eye, Heart, ImagePlus, Languages, LoaderCircle, LockKeyhole, Maximize2, MessageCircleHeart, MonitorPlay, RefreshCw, Send, ShieldCheck, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Language, useI18n } from '../i18n';

interface GalleryPost {
  id: string;
  guestName: string;
  message: string;
  photos: { url: string }[];
  createdAt: string;
  sourceLanguage: string;
  translations: Record<string, string>;
}

interface AdminSubmission {
  id: string;
  guestName: string;
  message: string;
  photos: { url: string }[];
  status: 'pending' | 'approved' | 'featured' | 'rejected';
  createdAt: string;
  sourceLanguage: string;
  translations: Record<string, string>;
}

interface GuestbookSchedule {
  submissionsOpen: boolean;
  acceptanceState: 'upcoming' | 'open' | 'closed';
  openAt: string | null;
  closeAt: string | null;
  wallVisible?: boolean;
  wallState?: 'upcoming' | 'open' | 'closed';
  wallOpenAt?: string | null;
  wallCloseAt?: string | null;
}

interface AdminSettings {
  autoApprove: boolean;
  submissionsOpenAt: string;
  submissionsCloseAt: string;
  wallOpenAt: string;
  wallCloseAt: string;
}

type TranslationProvider = 'openrouter' | 'kilogateway' | 'opencode-zen' | 'nvidia' | 'gemini' | 'ollama' | 'openai' | 'groq' | 'together' | 'cerebras' | 'deepinfra' | 'openai-compatible';

interface TranslationAdminSettings {
  enabled: boolean;
  providers: TranslationProviderConfig[];
}

interface TranslationProviderConfig {
  provider: TranslationProvider;
  model: string;
  baseUrl: string;
  priority: number;
  enabled: boolean;
  apiKeyCount: number;
  apiKeys?: string[];
}

const emptyTranslationProvider = (): TranslationProviderConfig => ({ provider: 'openrouter', model: '', baseUrl: 'https://ollama.com', priority: 1, enabled: true, apiKeyCount: 0, apiKeys: [] });

const translationLanguageNames: Record<string, string> = {
  en: 'English',
  ja: '日本語',
  ceb: 'Bisaya',
  tl: 'Tagalog',
  pt: 'Português',
};

async function readApiJson<T>(response: Response): Promise<T> {
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('The guestbook backend is not available yet. Deploy the latest code to Cloudflare and try again.');
  }
  return response.json() as Promise<T>;
}

const toLocalInput = (value?: string | null) => {
  if (!value) return '';
  const utc = new Date(`${value.replace(' ', 'T').replace(/Z$/, '')}Z`);
  return new Date(utc.getTime() - utc.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

interface Copy {
  formKicker: string;
  formTitle: string;
  formIntro: string;
  name: string;
  namePlaceholder: string;
  message: string;
  messagePlaceholder: string;
  photos: string;
  photoHint: string;
  consent: string;
  send: string;
  sending: string;
  success: string;
  successNote: string;
  wallKicker: string;
  wallTitle: string;
  wallEmpty: string;
  sharedBy: string;
  scheduleUpcoming: string;
  scheduleClosed: string;
  scheduleOpensAt: string;
  scheduleReturn: string;
  scheduleThanks: string;
}

const copy: Record<Language, Copy> = {
  en: {
    formKicker: 'A note for the groom',
    formTitle: 'Leave a Wedding Keepsake',
    formIntro: 'Share a message and up to three photos from today.',
    name: 'Your name',
    namePlaceholder: 'How should we remember you?',
    message: 'Your message',
    messagePlaceholder: 'A wish, a memory, or a few words from the heart…',
    photos: 'Photos from today',
    photoHint: 'Optional · up to 3 photos · each photo is resized before sending',
    consent: 'My message and photos may appear on the live wedding wall.',
    send: 'Send your keepsake',
    sending: 'Preparing your keepsake…',
    success: 'Your keepsake is safely with us.',
    successNote: 'Your memory will join the live wedding wall after approval.',
    wallKicker: 'Shared by our guests',
    wallTitle: 'The Wedding Wall',
    wallEmpty: 'The first wedding-day photos will appear here soon.',
    sharedBy: 'Shared by',
    scheduleUpcoming: 'The guestbook will open soon',
    scheduleClosed: 'The guestbook is now closed',
    scheduleOpensAt: 'Messages and photos can be sent from',
    scheduleReturn: 'Please return when the celebration begins.',
    scheduleThanks: 'Thank you for sharing this day with us.',
  },
  pt: {
    formKicker: 'Uma mensagem para o noivo',
    formTitle: 'Deixe uma Lembrança',
    formIntro: 'Escreva uma mensagem privada para Vinicius e compartilhe até três fotos de hoje.',
    name: 'Seu nome',
    namePlaceholder: 'Como devemos lembrar de você?',
    message: 'Sua mensagem',
    messagePlaceholder: 'Um desejo, uma lembrança ou algumas palavras do coração…',
    photos: 'Fotos de hoje',
    photoHint: 'Opcional · até 3 fotos · cada foto será reduzida antes do envio',
    consent: 'Tenho permissão para compartilhar estas fotos no site do casamento.',
    send: 'Enviar lembrança',
    sending: 'Preparando sua lembrança…',
    success: 'Sua lembrança chegou com segurança.',
    successNote: 'A mensagem será privada. As fotos aparecerão após aprovação.',
    wallKicker: 'Compartilhado pelos convidados',
    wallTitle: 'Mural do Casamento',
    wallEmpty: 'As primeiras fotos do casamento aparecerão aqui em breve.',
    sharedBy: 'Enviado por',
    scheduleUpcoming: 'O livro de visitas abrirá em breve',
    scheduleClosed: 'O livro de visitas está fechado',
    scheduleOpensAt: 'Mensagens e fotos poderão ser enviadas a partir de',
    scheduleReturn: 'Volte quando a celebração começar.',
    scheduleThanks: 'Obrigado por compartilhar este dia conosco.',
  },
  ja: {
    formKicker: '新郎へのメッセージ',
    formTitle: '結婚式の思い出を残す',
    formIntro: 'ヴィニシウスへ非公開のメッセージと、今日の写真を3枚までお送りください。',
    name: 'お名前',
    namePlaceholder: 'お名前をご入力ください',
    message: 'メッセージ',
    messagePlaceholder: 'お祝いの言葉や思い出をお書きください…',
    photos: '今日の写真',
    photoHint: '任意 · 3枚まで · 送信前に自動で軽量化します',
    consent: 'これらの写真を結婚式サイトで共有する許可を得ています。',
    send: '思い出を送る',
    sending: '送信の準備中…',
    success: '思い出をお預かりしました。',
    successNote: 'メッセージは非公開です。写真は承認後に掲載されます。',
    wallKicker: 'ゲストの皆さまより',
    wallTitle: 'ウェディングウォール',
    wallEmpty: '結婚式当日の写真がまもなくここに表示されます。',
    sharedBy: '撮影',
    scheduleUpcoming: 'ゲストブックはまもなく受付を開始します',
    scheduleClosed: 'ゲストブックの受付は終了しました',
    scheduleOpensAt: 'メッセージと写真の受付開始：',
    scheduleReturn: 'お祝いが始まりましたら、もう一度お越しください。',
    scheduleThanks: 'この日を一緒にお祝いしてくださり、ありがとうございました。',
  },
};

async function resizePhoto(file: File) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    throw new Error('Please choose a JPEG, PNG, or WebP photo.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();

    const scale = Math.min(1, 1920 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser could not prepare the photo.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((value) => (value ? resolve(value) : reject(new Error('The photo could not be resized.'))), 'image/jpeg', 0.82),
    );
    if (blob.size > 5_000_000) throw new Error('The prepared photo is still larger than 5 MB.');
    return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'wedding-photo'}.jpg`, { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function GuestForm({ eventCode }: { eventCode: string }) {
  const { language } = useI18n();
  const text = copy[language];
  const [guestName, setGuestName] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [photos, setPhotos] = useState<Array<{ file: File; preview: string }>>([]);
  const [state, setState] = useState<'idle' | 'sending' | 'success'>('idle');
  const [error, setError] = useState('');
  const [inputKey, setInputKey] = useState(0);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  useEffect(() => () => photosRef.current.forEach(({ preview }) => URL.revokeObjectURL(preview)), []);

  const choosePhotos = (files: FileList | null) => {
    const chosen = Array.from(files ?? []).slice(0, 3);
    photos.forEach(({ preview }) => URL.revokeObjectURL(preview));
    setPhotos(chosen.map((file) => ({ file, preview: URL.createObjectURL(file) })));
    setError(files && files.length > 3 ? 'Please choose no more than three photos.' : '');
  };

  const removePhoto = (index: number) => {
    setPhotos((current) => {
      URL.revokeObjectURL(current[index].preview);
      return current.filter((_, photoIndex) => photoIndex !== index);
    });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setState('sending');
    setError('');

    try {
      const form = new FormData();
      form.set('eventCode', eventCode);
      form.set('guestName', guestName);
      form.set('message', message);
      form.set('languageCode', language);
      form.set('consentToPublish', consent ? 'yes' : 'no');
      for (const { file } of photos) form.append('photos', await resizePhoto(file));

      const response = await fetch('/api/submissions', { method: 'POST', body: form });
      const result = await readApiJson<{ error?: string }>(response);
      if (!response.ok) throw new Error(result.error ?? 'The message could not be sent.');

      photos.forEach(({ preview }) => URL.revokeObjectURL(preview));
      setGuestName('');
      setMessage('');
      setPhotos([]);
      setConsent(false);
      setInputKey((value) => value + 1);
      setState('success');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'The message could not be sent.');
      setState('idle');
    }
  };

  if (state === 'success') {
    return (
      <div className="mx-auto max-w-xl rounded-[2rem] border border-sage-200/80 bg-white/75 px-6 py-12 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-600 text-white"><Check className="h-6 w-6" /></span>
        <h3 className="mt-5 font-serif text-3xl font-semibold text-wine-900">{text.success}</h3>
        <p className="mt-3 font-serif text-lg italic leading-relaxed text-sage-600">{text.successNote}</p>
        <button type="button" onClick={() => setState('idle')} className="mt-7 rounded-full border border-sage-300 px-6 py-2.5 font-montserrat text-[10px] font-bold uppercase tracking-[0.2em] text-sage-700 transition hover:bg-sage-50">
          Send another
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-[1.5rem] border border-sage-200/70 bg-white">
      <form onSubmit={submit} className="text-left">
        <div className="flex gap-3 px-5 pt-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-700 text-white"><Heart className="h-4 w-4 fill-white/25" /></span>
          <div className="min-w-0 flex-1">
            <label htmlFor="guest-name" className="sr-only">{text.name}</label>
            <input id="guest-name" required minLength={2} maxLength={100} value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Your name" className="w-full border-0 border-b border-sage-100 bg-transparent px-0 pb-2 font-montserrat text-xs font-bold tracking-wide text-sage-800 outline-none placeholder:font-normal placeholder:text-sage-400 focus:border-sage-400" />
            <label htmlFor="guest-message" className="sr-only">{text.message}</label>
            <textarea id="guest-message" required minLength={2} maxLength={2000} rows={3} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Share a wish, a story, or a few words from the heart…" className="mt-2 w-full resize-none border-0 bg-transparent p-0 font-serif text-lg leading-relaxed text-sage-900 outline-none placeholder:text-sage-400" />
          </div>
        </div>

        {photos.length > 0 && (
          <div className="mx-5 mt-3 grid grid-cols-3 gap-2" aria-label="Selected photo previews">
            {photos.map(({ file, preview }, index) => (
              <div key={`${file.name}-${file.lastModified}`} className="relative aspect-square overflow-hidden rounded-xl bg-sage-100">
                <img src={preview} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => removePhoto(index)} aria-label={`Remove ${file.name}`} className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-wine-900/85 text-white shadow focus:outline-none focus:ring-2 focus:ring-white"><X className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        )}

        <div className="mx-5 mt-3 flex items-center justify-between border-t border-sage-100 py-3">
          <label title={text.photoHint} className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 font-montserrat text-[10px] font-bold uppercase tracking-[0.14em] text-sage-700 transition hover:bg-sage-50 focus-within:ring-2 focus-within:ring-sage-200">
            <ImagePlus className="h-5 w-5 text-sage-600" />
            <span>Add photos <span className="font-normal normal-case tracking-normal text-sage-400">(optional)</span></span>
            <input key={inputKey} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => choosePhotos(event.target.files)} className="sr-only" />
          </label>
          <span className="text-[10px] tabular-nums text-sage-400">{message.length}/2000</span>
        </div>

        <label className="mx-5 flex cursor-pointer items-start gap-2 border-t border-sage-100 py-3 text-[11px] leading-relaxed text-sage-600">
          <input required type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-sage-700" />
          <span>My message and photos may appear on the live wedding wall.</span>
        </label>

        {error && <p role="alert" className="mx-5 mb-3 rounded-xl bg-wine-50 px-4 py-3 text-sm text-wine-800">{error}</p>}

        <button disabled={state === 'sending'} className="group flex w-full items-center justify-center gap-2 bg-sage-800 px-6 py-3.5 font-montserrat text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-sage-700 focus:outline-none focus:ring-4 focus:ring-inset focus:ring-sage-300 disabled:cursor-wait disabled:opacity-65">
          {state === 'sending' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 transition group-hover:translate-x-0.5" />}
          {state === 'sending' ? text.sending : text.send}
        </button>
      </form>
    </div>
  );
}

function TranslatedMessage({ post, className, dark = false }: { post: GalleryPost; className: string; dark?: boolean }) {
  const [language, setLanguage] = useState('original');
  const available = Object.entries(post.translations ?? {}).filter((entry): entry is [string, string] => Boolean(translationLanguageNames[entry[0]]) && typeof entry[1] === 'string');
  const message = language === 'original' ? post.message : post.translations[language] ?? post.message;
  useEffect(() => setLanguage('original'), [post.id]);

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p key={language} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className={className}>“{message}”</motion.p>
      </AnimatePresence>
      {available.length > 0 && (
        <label className={`mt-4 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 font-montserrat text-[9px] font-bold uppercase tracking-[0.12em] ${dark ? 'border-white/25 bg-black/20 text-white' : 'border-sage-200 bg-sage-50 text-sage-600'}`}>
          <Languages className="h-3.5 w-3.5" />
          <span className="sr-only">Message language</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value)} className="max-w-32 cursor-pointer bg-transparent outline-none">
            <option value="original">Original</option>
            {available.filter(([code]) => code !== post.sourceLanguage).map(([code]) => <option key={code} value={code}>{translationLanguageNames[code]}</option>)}
          </select>
        </label>
      )}
    </>
  );
}

function WeddingWall({ compact = false, projector = false }: { compact?: boolean; projector?: boolean }) {
  const { language } = useI18n();
  const text = copy[language];
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activePost, setActivePost] = useState(0);
  const [visibleCount, setVisibleCount] = useState(7);
  const [fullscreen, setFullscreen] = useState(false);
  const [newPostName, setNewPostName] = useState('');
  const projectorRef = useRef<HTMLElement>(null);
  const knownPostIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch('/api/gallery', { cache: 'no-store' });
        const result = await readApiJson<{ posts?: GalleryPost[] }>(response);
        if (active && response.ok) {
          const nextPosts = result.posts ?? [];
          if (knownPostIds.current) {
            const newest = nextPosts.find((post) => !knownPostIds.current?.has(post.id));
            if (newest) setNewPostName(newest.guestName);
          }
          knownPostIds.current = new Set(nextPosts.map((post) => post.id));
          setPosts(nextPosts);
        }
      } catch {
        if (active) setPosts([]);
      } finally {
        if (active) setLoaded(true);
      }
    };
    void load();
    const timer = window.setInterval(load, projector ? 5_000 : 15_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [projector]);

  useEffect(() => {
    if (!newPostName) return;
    const timer = window.setTimeout(() => setNewPostName(''), 5_000);
    return () => window.clearTimeout(timer);
  }, [newPostName]);

  useEffect(() => {
    if (!projector || posts.length < 2) return;
    const timer = window.setInterval(() => setActivePost((current) => (current + 1) % posts.length), 8_000);
    return () => window.clearInterval(timer);
  }, [projector, posts.length]);

  useEffect(() => {
    if (!projector) return;
    const syncFullscreen = () => setFullscreen(document.fullscreenElement === projectorRef.current);
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, [projector]);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await projectorRef.current?.requestFullscreen();
  };

  if (projector && loaded && posts.length > 0) {
    const post = posts[activePost % posts.length];
    return (
      <section ref={projectorRef} className={`relative overflow-hidden bg-white ${fullscreen ? 'h-screen rounded-none' : 'rounded-[2rem] border border-sage-200/70 bg-white/80'}`}>
        <button type="button" onClick={() => void toggleFullscreen()} aria-label={fullscreen ? 'Exit full screen' : 'Show full screen'} title={fullscreen ? 'Exit full screen' : 'Show full screen'} className={`absolute right-4 top-4 z-30 flex items-center justify-center bg-white/85 text-sage-800 backdrop-blur transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-sage-200 ${fullscreen ? 'h-10 w-10 rounded-full' : 'h-10 gap-2 rounded-full px-4 font-montserrat text-[9px] font-bold uppercase tracking-[0.14em]'}`}>
          {fullscreen ? <X className="h-4 w-4" /> : <><Maximize2 className="h-4 w-4" /><span>Full screen</span></>}
        </button>
        <AnimatePresence mode="wait">
          <motion.article key={post.id} initial={{ opacity: 0, x: 70 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -70 }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }} className={`grid ${fullscreen ? 'h-screen' : 'min-h-[calc(100vh-16rem)]'} ${post.photos.length > 0 ? 'lg:grid-cols-[1.15fr_0.85fr]' : ''}`}>
            {post.photos.length > 0 && <div className={`grid min-h-[420px] gap-1 overflow-hidden bg-sage-100 ${post.photos.length > 1 ? 'grid-cols-2' : ''}`}>
              {post.photos.slice(0, 2).map((photo) => (
                <motion.img key={photo.url} src={photo.url} alt={`Wedding memory shared by ${post.guestName}`} initial={{ scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: 8, ease: 'linear' }} className="h-full min-h-0 w-full object-cover" />
              ))}
            </div>}
            <div className={`flex flex-col justify-center px-10 py-10 lg:px-14 ${post.photos.length === 0 ? 'mx-auto max-w-5xl items-center text-center' : ''}`}>
              <p className="font-montserrat text-[11px] font-bold uppercase tracking-[0.28em] text-wine-600">A message from</p>
              <h2 className="mt-2 font-script text-5xl text-sage-900 lg:text-6xl">{post.guestName}</h2>
              <Heart className="mt-8 h-6 w-6 fill-wine-100 text-wine-500" />
              <TranslatedMessage post={post} className={`mt-5 font-serif italic leading-relaxed text-sage-800 ${post.photos.length === 0 ? 'text-5xl lg:text-6xl' : 'text-3xl lg:text-4xl'}`} />
              <div className={`mt-10 flex items-center justify-between gap-10 border-t border-sage-200 pt-4 font-montserrat text-[10px] font-bold uppercase tracking-[0.18em] text-sage-500 ${post.photos.length === 0 ? 'w-full max-w-2xl' : ''}`}><span>Vinicius & Irish · 08.12.26</span><span>{activePost + 1} / {posts.length}</span></div>
            </div>
          </motion.article>
        </AnimatePresence>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-sage-100"><motion.div key={post.id} initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 8, ease: 'linear' }} className="h-full bg-wine-500" /></div>
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-white/75 px-3 py-2 backdrop-blur">
          {posts.map((item, index) => <button key={item.id} type="button" onClick={() => setActivePost(index)} aria-label={`Show memory ${index + 1}`} className={`h-1.5 rounded-full transition-all ${index === activePost ? 'w-7 bg-sage-700' : 'w-1.5 bg-sage-300'}`} />)}
        </div>
      </section>
    );
  }

  return (
    <div className={compact || projector ? '' : 'mt-16'}>
      <AnimatePresence>
        {newPostName && <motion.div role="status" initial={{ opacity: 0, y: -18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} className="fixed left-1/2 top-5 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/80 bg-sage-900 px-5 py-3 text-white shadow-lg"><Sparkles className="h-4 w-4 text-wine-200" /><span className="font-montserrat text-[9px] font-bold uppercase tracking-[0.14em]">A new memory from {newPostName}</span></motion.div>}
      </AnimatePresence>
      <div className={`${compact ? 'flex items-end justify-between gap-4 text-left' : 'text-center'}`}>
        <div>
        <Camera className={`${compact ? '' : 'mx-auto'} h-4 w-4 text-sage-500`} />
        <p className="mt-3 font-montserrat text-[10px] font-semibold uppercase tracking-[0.3em] text-sage-600">{text.wallKicker}</p>
        <h2 className={`${projector ? 'text-5xl' : 'text-3xl'} mt-1 font-serif font-semibold text-sage-900`}>{text.wallTitle}</h2>
        </div>
        {compact && loaded && <span className="pb-1 font-montserrat text-[9px] font-bold uppercase tracking-[0.16em] text-sage-400">Showing {Math.min(visibleCount, posts.length)} of {posts.length}</span>}
      </div>

      {loaded && posts.length === 0 ? (
        <p className={`${compact ? 'w-full' : 'max-w-md'} mt-5 rounded-2xl border border-sage-200 bg-white/60 px-5 py-5 text-center font-serif italic text-sage-600`}>{text.wallEmpty}</p>
      ) : (
        <div className={`mt-6 grid gap-5 ${compact ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          {posts.slice(0, compact ? visibleCount : posts.length).map((post, index) => {
            const imageFeature = compact && post.photos.length > 0 && index % 7 === 0;
            const quoteFeature = compact && post.photos.length === 0 && index % 7 === 3;

            return (
              <motion.article layout key={post.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.06 }} className={`relative overflow-hidden rounded-2xl border ${imageFeature ? 'flex min-h-80 items-end lg:col-span-2 sm:min-h-[26rem]' : compact && post.photos.length > 0 ? 'sm:grid sm:grid-cols-[140px_1fr]' : ''} ${quoteFeature ? 'lg:col-span-2 border-sage-700 bg-sage-800' : imageFeature ? 'border-sage-700/20 bg-sage-900' : 'border-sage-200/80 bg-white'}`}>
                {post.photos.length > 0 && (
                  <div className={imageFeature ? 'absolute inset-0' : 'grid gap-1'}>
                    {post.photos.slice(0, 1).map((photo) => <img key={photo.url} src={photo.url} alt={`Wedding memory shared by ${post.guestName}`} loading="lazy" decoding="async" referrerPolicy="no-referrer" className={`${imageFeature ? 'h-full' : compact ? 'h-full min-h-40' : 'aspect-[4/3]'} w-full object-cover`} />)}
                    {imageFeature && <div className="absolute inset-0 bg-gradient-to-t from-sage-950/95 via-sage-950/45 to-transparent" aria-hidden="true" />}
                  </div>
                )}
                <div className={`relative z-10 flex w-full flex-col justify-center ${quoteFeature ? 'items-center px-7 py-10 text-center sm:px-14' : imageFeature ? 'p-7 sm:max-w-4xl sm:p-10' : 'p-5'}`}>
                  <Heart className={`h-4 w-4 ${quoteFeature || imageFeature ? 'fill-wine-300/20 text-wine-200' : 'fill-wine-100 text-wine-500'}`} />
                  <TranslatedMessage post={post} dark={quoteFeature || imageFeature} className={`mt-3 font-serif italic leading-relaxed ${quoteFeature ? 'max-w-4xl text-3xl text-white sm:text-4xl' : imageFeature ? 'text-2xl text-white drop-shadow-sm sm:text-4xl' : 'text-lg text-sage-800'}`} />
                  <div className={`mt-5 flex w-full items-center justify-between gap-3 border-t pt-3 ${quoteFeature ? 'max-w-2xl border-white/15' : imageFeature ? 'border-white/25' : 'border-sage-100'}`}><span className={`font-montserrat text-[9px] font-bold uppercase tracking-[0.16em] ${quoteFeature || imageFeature ? 'text-white' : 'text-sage-600'}`}>{post.guestName}</span><time className={`text-[9px] ${quoteFeature || imageFeature ? 'text-white/70' : 'text-sage-400'}`}>{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
      {compact && visibleCount < posts.length && <div className="mt-7 flex justify-center"><button type="button" onClick={() => setVisibleCount((current) => current + 6)} className="rounded-full border border-sage-300 bg-white/70 px-6 py-3 font-montserrat text-[9px] font-bold uppercase tracking-[0.16em] text-sage-700 transition hover:bg-white">Load more memories</button></div>}
    </div>
  );
}

function ScheduleNotice({ schedule }: { schedule: GuestbookSchedule }) {
  const { language } = useI18n();
  const text = copy[language];
  const starts = schedule.openAt ? new Date(`${schedule.openAt.replace(' ', 'T').replace(/Z$/, '')}Z`).toLocaleString() : null;
  const ended = schedule.acceptanceState === 'closed';

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-sage-200 bg-white/75 px-6 py-10 text-center shadow-lg">
      <LockKeyhole className="mx-auto h-7 w-7 text-wine-700" />
      <h2 className="mt-4 font-serif text-3xl text-wine-900">{ended ? text.scheduleClosed : text.scheduleUpcoming}</h2>
      <p className="mt-3 font-serif text-lg italic text-sage-600">{ended ? text.scheduleThanks : starts ? `${text.scheduleOpensAt} ${starts}.` : text.scheduleReturn}</p>
    </div>
  );
}

function WallScheduleNotice({ schedule, eventCode }: { schedule: GuestbookSchedule; eventCode: string }) {
  const upcoming = schedule.wallState === 'upcoming';
  const opens = schedule.wallOpenAt ? new Date(`${schedule.wallOpenAt.replace(' ', 'T').replace(/Z$/, '')}Z`).toLocaleString() : null;

  return (
    <section className="mx-auto mt-16 max-w-xl rounded-[2rem] border border-sage-200 bg-white/75 px-7 py-12 text-center">
      <LockKeyhole className="mx-auto h-7 w-7 text-wine-700" />
      <p className="mt-5 font-montserrat text-[9px] font-bold uppercase tracking-[0.24em] text-sage-500">Private until the celebration</p>
      <h1 className="mt-2 font-serif text-4xl text-sage-900">{upcoming ? 'The wedding wall opens soon' : 'The wedding wall is not available'}</h1>
      <p className="mx-auto mt-4 max-w-md font-serif text-lg italic leading-relaxed text-sage-600">{upcoming && opens ? `Please return on ${opens}.` : 'Messages and photos are only shown during the time chosen by the couple.'}</p>
      <a href={`/?guestbook=${eventCode}`} className="mt-7 inline-flex rounded-full bg-sage-800 px-6 py-3 font-montserrat text-[9px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-sage-700">Back to guestbook</a>
    </section>
  );
}

function AdminPanel() {
  const [token, setToken] = useState(() => sessionStorage.getItem('wedding-admin-token') ?? '');
  const [draftToken, setDraftToken] = useState(token);
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [autoApprove, setAutoApprove] = useState(false);
  const [settings, setSettings] = useState<AdminSettings>({
    autoApprove: false,
    submissionsOpenAt: '',
    submissionsCloseAt: '',
    wallOpenAt: '',
    wallCloseAt: '',
  });
  const [translationSettings, setTranslationSettings] = useState<TranslationAdminSettings>({ enabled: false, providers: [] });
  const [translationDraft, setTranslationDraft] = useState<TranslationProviderConfig>(emptyTranslationProvider);
  const [translationKeys, setTranslationKeys] = useState('');
  const [translationModels, setTranslationModels] = useState<string[]>([]);
  const [savingTranslation, setSavingTranslation] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(token));
  const [newSubmissionIds, setNewSubmissionIds] = useState<string[]>([]);
  const knownSubmissionIds = useRef<Set<string> | null>(null);

  const load = async (credential: string, silent = false) => {
    if (!silent) setLoading(true);
    if (!silent) setError('');
    try {
      const response = await fetch('/api/admin/submissions', { headers: { Authorization: `Bearer ${credential}` } });
      const result = await readApiJson<{ submissions?: AdminSubmission[]; settings?: { autoApprove?: boolean; submissionsOpenAt?: string | null; submissionsCloseAt?: string | null; wallOpenAt?: string | null; wallCloseAt?: string | null }; translationSettings?: TranslationAdminSettings | null; error?: string }>(response);
      if (!response.ok) throw new Error(result.error ?? 'Could not load submissions.');
      const nextSubmissions = result.submissions ?? [];
      if (knownSubmissionIds.current) setNewSubmissionIds(nextSubmissions.filter((item) => !knownSubmissionIds.current?.has(item.id)).map((item) => item.id));
      knownSubmissionIds.current = new Set(nextSubmissions.map((item) => item.id));
      sessionStorage.setItem('wedding-admin-token', credential);
      setToken(credential);
      setSubmissions(nextSubmissions);
      setAutoApprove(Boolean(result.settings?.autoApprove));
      setSettings({
        autoApprove: Boolean(result.settings?.autoApprove),
        submissionsOpenAt: toLocalInput(result.settings?.submissionsOpenAt),
        submissionsCloseAt: toLocalInput(result.settings?.submissionsCloseAt),
        wallOpenAt: toLocalInput(result.settings?.wallOpenAt),
        wallCloseAt: toLocalInput(result.settings?.wallCloseAt),
      });
      if (result.translationSettings) {
        setTranslationSettings(result.translationSettings);
        if (!silent) setTranslationDraft(result.translationSettings.providers[0] ?? emptyTranslationProvider());
      }
    } catch (loadError) {
      if (loadError instanceof Error && loadError.message === 'Unauthorized.') {
        sessionStorage.removeItem('wedding-admin-token');
        setToken('');
      }
      setError(loadError instanceof Error ? loadError.message : 'Could not load submissions.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => { if (token) void load(token); }, []);

  useEffect(() => {
    if (!token) return;
    const timer = window.setInterval(() => void load(token, true), 5_000);
    return () => window.clearInterval(timer);
  }, [token]);

  useEffect(() => {
    if (newSubmissionIds.length === 0) return;
    const timer = window.setTimeout(() => setNewSubmissionIds([]), 5_000);
    return () => window.clearTimeout(timer);
  }, [newSubmissionIds]);

  const moderate = async (id: string, status: AdminSubmission['status']) => {
    const response = await fetch(`/api/admin/submissions/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (response.ok) setSubmissions((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    else setError('The submission could not be updated.');
  };

  const changeAutoApprove = async (enabled: boolean) => {
    setSavingSettings(true);
    setError('');
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoApprove: enabled }),
      });
      if (!response.ok) throw new Error('Automatic approval could not be updated.');
      setAutoApprove(enabled);
      setSettings((current) => ({ ...current, autoApprove: enabled }));
    } catch (settingsError) {
      setError(settingsError instanceof Error ? settingsError.message : 'Automatic approval could not be updated.');
    } finally {
      setSavingSettings(false);
    }
  };

  const saveSchedule = async () => {
    if (settings.submissionsOpenAt && settings.submissionsCloseAt && settings.submissionsOpenAt >= settings.submissionsCloseAt) {
      setError('The form closing time must be after its opening time.');
      return;
    }
    if (settings.wallOpenAt && settings.wallCloseAt && settings.wallOpenAt >= settings.wallCloseAt) {
      setError('The wall closing time must be after its opening time.');
      return;
    }
    setSavingSchedule(true);
    setError('');
    try {
      const asUtc = (value: string) => value ? new Date(value).toISOString() : null;
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionsOpenAt: asUtc(settings.submissionsOpenAt),
          submissionsCloseAt: asUtc(settings.submissionsCloseAt),
          wallOpenAt: asUtc(settings.wallOpenAt),
          wallCloseAt: asUtc(settings.wallCloseAt),
        }),
      });
      if (!response.ok) throw new Error('The schedule could not be saved.');
    } catch (scheduleError) {
      setError(scheduleError instanceof Error ? scheduleError.message : 'The schedule could not be saved.');
    } finally {
      setSavingSchedule(false);
    }
  };

  const saveTranslationProvider = async () => {
    setSavingTranslation(true);
    setError('');
    try {
      const keys = translationKeys.split(/[\n,]+/).map((key) => key.trim()).filter(Boolean);
      const response = await fetch('/api/admin/translation-providers', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...translationDraft, ...(keys.length > 0 ? { apiKeys: keys } : {}) }),
      });
      const result = await readApiJson<{ error?: string }>(response);
      if (!response.ok) throw new Error(result.error ?? 'Provider settings could not be saved.');
      const saved = { ...translationDraft, apiKeyCount: keys.length || translationDraft.apiKeyCount, apiKeys: keys.length ? keys.map((key) => `••••${key.slice(-4)}`) : translationDraft.apiKeys };
      setTranslationDraft(saved);
      setTranslationSettings((current) => ({ enabled: true, providers: [...current.providers.filter((item) => item.provider !== saved.provider), saved].sort((a, b) => a.priority - b.priority) }));
      setTranslationKeys('');
      return true;
    } catch (translationError) {
      setError(translationError instanceof Error ? translationError.message : 'Provider settings could not be saved.');
      return false;
    } finally {
      setSavingTranslation(false);
    }
  };

  const loadTranslationModels = async () => {
    setLoadingModels(true);
    setError('');
    try {
      const keys = translationKeys.split(/[\n,]+/).map((key) => key.trim()).filter(Boolean);
      const response = await fetch('/api/admin/translation-models', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: translationDraft.provider, baseUrl: translationDraft.baseUrl, ...(keys.length ? { apiKeys: keys } : {}) }) });
      const result = await readApiJson<{ models?: string[]; error?: string }>(response);
      if (!response.ok) throw new Error(result.error ?? 'Models could not be loaded.');
      setTranslationModels(result.models ?? []);
    } catch (modelError) {
      setError(modelError instanceof Error ? modelError.message : 'Models could not be loaded.');
    } finally {
      setLoadingModels(false);
    }
  };

  const saveAndLoadTranslationModels = async () => {
    await loadTranslationModels();
  };

  const toggleTranslation = (enabled: boolean) => {
    setTranslationSettings((current) => ({ ...current, enabled }));
    void fetch('/api/admin/translation-enabled', { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled }) });
  };

  if (!token || error === 'Unauthorized.') {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-sage-200 bg-white/80 p-7 shadow-xl">
        <LockKeyhole className="mx-auto h-7 w-7 text-wine-700" />
        <h2 className="mt-4 text-center font-serif text-3xl text-wine-900">Wedding wall review</h2>
        <form onSubmit={(event) => { event.preventDefault(); void load(draftToken); }} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-wider text-sage-700">Admin token<input type="password" required value={draftToken} onChange={(event) => setDraftToken(event.target.value)} className="rounded-xl border border-sage-200 px-4 py-3 text-base font-normal normal-case tracking-normal outline-none focus:border-wine-400" /></label>
          {error && <p role="alert" className="text-sm text-wine-700">{error}</p>}
          <button disabled={loading} className="rounded-full bg-wine-800 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white">{loading ? 'Checking…' : 'Open review'}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <AnimatePresence>
        {newSubmissionIds.length > 0 && <motion.div role="status" initial={{ opacity: 0, y: -18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} className="fixed left-1/2 top-5 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/80 bg-sage-900 px-5 py-3 text-white shadow-lg"><MessageCircleHeart className="h-4 w-4 text-wine-200" /><span className="font-montserrat text-[9px] font-bold uppercase tracking-[0.14em]">{newSubmissionIds.length === 1 ? 'A new guest memory arrived' : `${newSubmissionIds.length} new guest memories arrived`}</span></motion.div>}
      </AnimatePresence>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-sage-200 pb-5">
        <div><p className="font-montserrat text-[10px] font-bold uppercase tracking-[0.24em] text-sage-500">Private dashboard</p><h2 className="mt-1 font-serif text-4xl text-sage-900">Guest messages</h2></div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <a href="/?guestbook=0812&preview=1" className="inline-flex items-center gap-2 rounded-full border border-sage-300 bg-white/70 px-4 py-2.5 font-montserrat text-[9px] font-bold uppercase tracking-[0.14em] text-sage-700 transition hover:bg-white"><Eye className="h-3.5 w-3.5" /> Guest preview</a>
          <a href="/?guestbook=0812&wall=1&preview=1" className="inline-flex items-center gap-2 rounded-full bg-sage-800 px-4 py-2.5 font-montserrat text-[9px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-sage-700"><MonitorPlay className="h-3.5 w-3.5" /> Projector preview</a>
          <span className="ml-1 flex items-center gap-2 font-montserrat text-[9px] font-bold uppercase tracking-[0.14em] text-sage-500"><ShieldCheck className="h-4 w-4" /> {submissions.filter((item) => item.status === 'pending').length} awaiting review</span>
        </div>
      </div>
      <section className="mt-5 rounded-2xl border border-sage-200/80 bg-white/75 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-serif text-xl font-semibold text-sage-900">Visibility schedule</h3><p className="mt-0.5 text-xs text-sage-500">Times are shown in your device’s local timezone. Leave a field empty for no limit.</p></div><button type="button" disabled={savingSchedule} onClick={() => void saveSchedule()} className="rounded-full bg-sage-800 px-5 py-2.5 font-montserrat text-[9px] font-bold uppercase tracking-[0.16em] text-white disabled:opacity-50">{savingSchedule ? 'Saving…' : 'Save schedule'}</button></div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {([
            ['Guest submission form', 'Control when guests can send messages and photos.', 'submissionsOpenAt', 'submissionsCloseAt'],
            ['Public wedding wall', 'Control when approved memories appear publicly and on the projector.', 'wallOpenAt', 'wallCloseAt'],
          ] as const).map(([title, description, openField, closeField]) => (
            <fieldset key={title} className="rounded-xl bg-sage-50/65 p-4">
              <legend className="sr-only">{title}</legend>
              <h4 className="font-serif text-lg font-semibold text-sage-900">{title}</h4>
              <p className="mt-0.5 min-h-8 text-[11px] leading-relaxed text-sage-500">{description}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 font-montserrat text-[9px] font-bold uppercase tracking-[0.14em] text-sage-600">Visible from<input type="datetime-local" value={settings[openField]} onChange={(event) => setSettings((current) => ({ ...current, [openField]: event.target.value }))} className="min-w-0 rounded-lg border border-sage-200 bg-white px-3 py-2.5 font-sans text-xs font-normal normal-case tracking-normal text-sage-800 outline-none focus:border-sage-500" /></label>
                <label className="grid gap-1.5 font-montserrat text-[9px] font-bold uppercase tracking-[0.14em] text-sage-600">Visible until<input type="datetime-local" value={settings[closeField]} onChange={(event) => setSettings((current) => ({ ...current, [closeField]: event.target.value }))} className="min-w-0 rounded-lg border border-sage-200 bg-white px-3 py-2.5 font-sans text-xs font-normal normal-case tracking-normal text-sage-800 outline-none focus:border-sage-500" /></label>
              </div>
            </fieldset>
          ))}
        </div>
      </section>
      <label className="mt-5 flex cursor-pointer items-center justify-between gap-5 rounded-2xl border border-sage-200/80 bg-white/70 px-5 py-4">
        <span><span className="block font-serif text-lg font-semibold text-sage-900">Auto-publish new photos</span><span className="mt-0.5 block text-xs text-sage-500">Turn off when you want to review each submission first.</span></span>
        <span className="relative inline-flex shrink-0 items-center">
          <input type="checkbox" role="switch" checked={autoApprove} disabled={savingSettings} onChange={(event) => void changeAutoApprove(event.target.checked)} className="peer sr-only" />
          <span className="h-6 w-11 rounded-full bg-sage-200 transition peer-checked:bg-sage-700 peer-focus-visible:ring-4 peer-focus-visible:ring-sage-200 peer-disabled:opacity-50" />
          <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
        </span>
      </label>
      <section className="mt-5 rounded-2xl border border-sage-200/80 bg-white/75 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><div className="flex items-center gap-2"><Languages className="h-4 w-4 text-wine-600" /><h3 className="font-serif text-xl font-semibold text-sage-900">AI translation</h3></div><p className="mt-1 max-w-2xl text-xs leading-relaxed text-sage-500">Create English, Japanese, Bisaya, Tagalog, and Portuguese versions before a message is published. The original always appears first.</p></div>
          <label className="relative inline-flex shrink-0 cursor-pointer items-center">
            <input type="checkbox" role="switch" checked={translationSettings.enabled} onChange={(event) => toggleTranslation(event.target.checked)} className="peer sr-only" />
            <span className="h-6 w-11 rounded-full bg-sage-200 transition peer-checked:bg-sage-700 peer-focus-visible:ring-4 peer-focus-visible:ring-sage-200" />
            <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
          </label>
        </div>
        <AnimatePresence initial={false}>
        {translationSettings.enabled && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
        {translationSettings.providers.length > 0 && <div className="mt-5 grid gap-2 sm:grid-cols-2">{translationSettings.providers.map((item) => <button key={item.provider} type="button" onClick={() => { setTranslationDraft(item); setTranslationModels([]); setTranslationKeys(''); }} className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${item.provider === translationDraft.provider ? 'border-sage-600 bg-sage-50' : 'border-sage-200 bg-white hover:border-sage-400'}`}><span><span className="block font-montserrat text-[9px] font-bold uppercase tracking-[0.14em] text-wine-600">Priority {item.priority}</span><span className="mt-1 block font-serif text-base text-sage-900">{item.provider} · {item.model || 'Choose model'}</span></span><span className="text-[10px] text-sage-500">{item.apiKeyCount} keys</span></button>)}</div>}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-1.5 font-montserrat text-[9px] font-bold uppercase tracking-[0.14em] text-sage-600">Provider
            <select value={translationDraft.provider} onChange={(event) => { const provider = event.target.value as TranslationProvider; const saved = translationSettings.providers.find((item) => item.provider === provider); setTranslationModels([]); setTranslationKeys(''); setTranslationDraft(saved ?? { ...emptyTranslationProvider(), provider, priority: Math.max(0, ...translationSettings.providers.map((item) => item.priority)) + 1, baseUrl: provider === 'openai-compatible' ? '' : 'https://ollama.com' }); }} className="rounded-lg border border-sage-200 bg-white px-3 py-2.5 font-sans text-sm font-normal normal-case tracking-normal text-sage-800 outline-none focus:border-sage-500">
              <option value="openrouter">OpenRouter</option><option value="kilogateway">Kilo Gateway</option><option value="opencode-zen">OpenCode Zen</option><option value="nvidia">NVIDIA NIM</option><option value="gemini">Google Gemini</option><option value="openai">OpenAI</option><option value="groq">Groq</option><option value="together">Together AI</option><option value="cerebras">Cerebras</option><option value="deepinfra">DeepInfra</option><option value="ollama">Ollama / Ollama Cloud</option><option value="openai-compatible">Other OpenAI-compatible API</option>
            </select>
          </label>
          <label className="grid gap-1.5 font-montserrat text-[9px] font-bold uppercase tracking-[0.14em] text-sage-600">Model
            <div className="flex gap-2">{translationModels.length > 0 ? <select required value={translationDraft.model} onChange={(event) => setTranslationDraft((current) => ({ ...current, model: event.target.value }))} className="min-w-0 flex-1 rounded-lg border border-sage-200 bg-white px-3 py-2.5 font-sans text-sm font-normal normal-case tracking-normal text-sage-800 outline-none focus:border-sage-500"><option value="">Select from {translationModels.length} models</option>{translationModels.map((model) => <option key={model} value={model}>{model}</option>)}</select> : <input required value={translationDraft.model} onChange={(event) => setTranslationDraft((current) => ({ ...current, model: event.target.value }))} placeholder="Paste a key, then click refresh" className="min-w-0 flex-1 rounded-lg border border-sage-200 bg-white px-3 py-2.5 font-sans text-sm font-normal normal-case tracking-normal text-sage-800 outline-none focus:border-sage-500" />}<button type="button" onClick={() => void saveAndLoadTranslationModels()} disabled={loadingModels || savingTranslation || (!translationKeys.trim() && translationDraft.apiKeyCount === 0)} title="Load models" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-sage-200 bg-white text-sage-600 transition hover:bg-sage-50 disabled:opacity-40"><RefreshCw className={`h-4 w-4 ${loadingModels || savingTranslation ? 'animate-spin' : ''}`} /></button></div>
            {translationModels.length > 0 && <span className="font-sans text-[11px] font-normal normal-case tracking-normal text-sage-500">{translationModels.length} models loaded from {translationDraft.provider}.</span>}
          </label>
          {['ollama', 'openai-compatible'].includes(translationDraft.provider) && <label className="grid gap-1.5 font-montserrat text-[9px] font-bold uppercase tracking-[0.14em] text-sage-600 md:col-span-2">{translationDraft.provider === 'ollama' ? 'Ollama server URL' : 'OpenAI-compatible base URL'}<input type="url" value={translationDraft.baseUrl} onChange={(event) => setTranslationDraft((current) => ({ ...current, baseUrl: event.target.value }))} placeholder={translationDraft.provider === 'ollama' ? 'https://ollama.com' : 'https://provider.example/v1'} className="rounded-lg border border-sage-200 bg-white px-3 py-2.5 font-sans text-sm font-normal normal-case tracking-normal text-sage-800 outline-none focus:border-sage-500" /></label>}
          <label className="grid gap-1.5 font-montserrat text-[9px] font-bold uppercase tracking-[0.14em] text-sage-600">Priority<input type="number" min="1" max="99" value={translationDraft.priority} onChange={(event) => setTranslationDraft((current) => ({ ...current, priority: Number(event.target.value) || 1 }))} className="rounded-lg border border-sage-200 bg-white px-3 py-2.5 font-sans text-sm font-normal normal-case tracking-normal text-sage-800 outline-none focus:border-sage-500" /><span className="font-sans text-[11px] font-normal normal-case tracking-normal text-sage-500">1 runs first; higher numbers are fallbacks.</span></label>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-sage-200 bg-sage-50/60 px-4 py-3"><span><span className="block font-montserrat text-[9px] font-bold uppercase tracking-[0.14em] text-sage-600">Use this provider</span><span className="mt-1 block text-[11px] text-sage-500">Disabled providers stay saved but are skipped.</span></span><input type="checkbox" checked={translationDraft.enabled} onChange={(event) => setTranslationDraft((current) => ({ ...current, enabled: event.target.checked }))} className="h-4 w-4 accent-sage-700" /></label>
          <label className="grid gap-1.5 font-montserrat text-[9px] font-bold uppercase tracking-[0.14em] text-sage-600 md:col-span-2">API keys
            <textarea rows={3} value={translationKeys} onChange={(event) => setTranslationKeys(event.target.value)} placeholder={translationDraft.apiKeyCount ? `${translationDraft.apiKeyCount} encrypted key${translationDraft.apiKeyCount === 1 ? '' : 's'} saved · leave empty to keep them` : 'Paste one API key per line'} className="resize-y rounded-lg border border-sage-200 bg-white px-3 py-2.5 font-mono text-xs font-normal normal-case tracking-normal text-sage-800 outline-none placeholder:font-sans placeholder:text-sage-400 focus:border-sage-500" />
            <span className="font-sans text-[11px] font-normal normal-case tracking-normal text-sage-500">New keys replace the saved pool. Keys are encrypted before storage and rotate automatically. If you change the admin token, enter the keys again.</span>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-sage-100 pt-4"><div className="flex flex-wrap items-center gap-2"><span className="text-xs text-sage-500">{translationDraft.apiKeyCount} key{translationDraft.apiKeyCount === 1 ? '' : 's'} saved for {translationDraft.provider}</span>{translationDraft.apiKeys?.map((key, index) => <span key={`${key}-${index}`} className="rounded-full border border-sage-200 bg-sage-50 px-2.5 py-1 font-mono text-[10px] text-sage-600">Key {index + 1} · {key}</span>)}</div><button type="button" disabled={savingTranslation || (!translationKeys.trim() && translationDraft.apiKeyCount === 0)} onClick={() => void saveTranslationProvider()} className="rounded-full bg-sage-800 px-5 py-2.5 font-montserrat text-[9px] font-bold uppercase tracking-[0.16em] text-white disabled:opacity-50">{savingTranslation ? 'Saving…' : 'Save provider'}</button></div>
        </motion.div>}
        </AnimatePresence>
      </section>
      {error && <p role="alert" className="mt-5 rounded-xl bg-wine-50 p-4 text-wine-800">{error}</p>}
      <div className="mt-5 grid gap-3">
        <AnimatePresence initial={false}>
        {submissions.map((submission) => (
          <motion.article layout key={submission.id} initial={{ opacity: 0, y: -22, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className={`grid gap-5 rounded-2xl border bg-white/80 p-5 transition-colors md:grid-cols-[minmax(0,1fr)_220px] ${newSubmissionIds.includes(submission.id) ? 'border-wine-300 bg-wine-50/35' : 'border-sage-200/80'}`}>
            <div className="min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-serif text-2xl font-semibold text-sage-900">{submission.guestName}</h3><time className="font-montserrat text-[9px] uppercase tracking-wider text-sage-400">{new Date(submission.createdAt).toLocaleString()}</time></div><span className={`rounded-full px-2.5 py-1 font-montserrat text-[9px] font-bold uppercase tracking-wider ${submission.status === 'approved' ? 'bg-sage-100 text-sage-700' : submission.status === 'featured' ? 'bg-amber-100 text-amber-800' : submission.status === 'rejected' ? 'bg-wine-100 text-wine-800' : 'bg-stone-100 text-stone-600'}`}>{submission.status}</span></div>
              <p className="mt-3 whitespace-pre-wrap font-serif text-lg leading-relaxed text-sage-700">{submission.message}</p>
              {Object.keys(submission.translations ?? {}).length > 0 && <details className="mt-3 rounded-xl bg-sage-50 px-4 py-3"><summary className="cursor-pointer font-montserrat text-[9px] font-bold uppercase tracking-[0.14em] text-sage-600">View AI translations</summary><div className="mt-3 grid gap-3 sm:grid-cols-2">{Object.entries(submission.translations).filter(([code]) => code !== submission.sourceLanguage).map(([code, value]) => <div key={code}><p className="font-montserrat text-[8px] font-bold uppercase tracking-[0.14em] text-wine-600">{translationLanguageNames[code] ?? code}</p><p className="mt-1 whitespace-pre-wrap font-serif text-sm leading-relaxed text-sage-700">{value}</p></div>)}</div></details>}
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-sage-100 pt-4">
                <button type="button" onClick={() => void moderate(submission.id, 'approved')} className="rounded-full bg-sage-700 px-4 py-2 font-montserrat text-[9px] font-bold uppercase tracking-wider text-white">Approve</button>
                <button type="button" onClick={() => void moderate(submission.id, 'featured')} className="rounded-full border border-amber-300 px-4 py-2 font-montserrat text-[9px] font-bold uppercase tracking-wider text-amber-800">Feature</button>
                <button type="button" onClick={() => void moderate(submission.id, 'rejected')} className="px-3 py-2 font-montserrat text-[9px] font-bold uppercase tracking-wider text-wine-700">Reject</button>
                {submission.status !== 'pending' && <button type="button" onClick={() => void moderate(submission.id, 'pending')} className="px-3 py-2 font-montserrat text-[9px] font-bold uppercase tracking-wider text-sage-500">Reset</button>}
              </div>
            </div>
            {submission.photos.length > 0 && <div className="grid grid-cols-2 gap-2 self-start">{submission.photos.map((photo) => <img key={photo.url} src={photo.url} alt="Guest submission" className="aspect-square w-full rounded-xl object-cover" />)}</div>}
          </motion.article>
        ))}
        </AnimatePresence>
        {!loading && submissions.length === 0 && <p className="rounded-2xl border border-dashed border-sage-300 p-8 text-center font-serif italic text-sage-600">No guest keepsakes yet.</p>}
      </div>
    </div>
  );
}

function GuestbookInvitation() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch('/api/schedule', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((schedule: GuestbookSchedule) => setOpen(schedule.submissionsOpen))
      .catch(() => setOpen(false));
  }, []);

  if (!open) return null;

  return (
    <section id="section-guestbook" className="relative overflow-hidden bg-[#F3F4F1] px-5 py-16 sm:py-20">
      <div className="absolute inset-0 opacity-35 [background:radial-gradient(circle_at_18%_30%,#cbd7cb_0,transparent_32%),radial-gradient(circle_at_82%_70%,#eadadd_0,transparent_30%)]" />
      <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative mx-auto max-w-2xl rounded-[2rem] border border-white/80 bg-white/75 px-6 py-10 text-center shadow-[0_28px_70px_-38px_rgba(42,65,48,0.5)] backdrop-blur sm:px-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-700 text-white shadow-lg"><MessageCircleHeart className="h-6 w-6" /></span>
        <p className="mt-5 font-montserrat text-[10px] font-bold uppercase tracking-[0.28em] text-sage-600">Live wedding guestbook</p>
        <h2 className="mt-2 font-serif text-4xl font-semibold text-sage-900 sm:text-5xl">Share this moment with us</h2>
        <p className="mx-auto mt-4 max-w-lg font-serif text-lg italic leading-relaxed text-sage-600">Leave a message for the groom and add the photos you captured today.</p>
        <a href="/?guestbook=0812" className="mt-7 inline-flex items-center gap-2 rounded-full bg-wine-800 px-7 py-4 font-montserrat text-[10px] font-bold uppercase tracking-[0.22em] text-white shadow-[0_14px_30px_-14px_rgba(91,31,39,0.75)] transition hover:-translate-y-0.5 hover:bg-wine-700 focus:outline-none focus:ring-4 focus:ring-wine-200">
          <Sparkles className="h-4 w-4" /> Share a memory
        </a>
      </motion.div>
    </section>
  );
}

export default function WeddingGuestbook() {
  const parameters = new URLSearchParams(window.location.search);
  const eventCode = parameters.get('guestbook');
  const adminMode = parameters.get('admin') === '1';
  const wallMode = parameters.get('wall') === '1';
  const previewRequested = parameters.get('preview') === '1';
  const [schedule, setSchedule] = useState<GuestbookSchedule | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [previewAuthorized, setPreviewAuthorized] = useState(false);
  const [guideOpen, setGuideOpen] = useState(() => Boolean(eventCode) && !adminMode && !wallMode && localStorage.getItem('wedding-guestbook-guide') !== 'seen');

  const dismissGuide = () => {
    localStorage.setItem('wedding-guestbook-guide', 'seen');
    setGuideOpen(false);
  };

  useEffect(() => {
    if (adminMode || !eventCode) return;
    fetch('/api/schedule', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((value: GuestbookSchedule) => setSchedule(value))
      .catch(() => setSchedule({ submissionsOpen: false, acceptanceState: 'closed', openAt: null, closeAt: null, wallVisible: false, wallState: 'closed' }));
  }, [adminMode, eventCode]);

  useEffect(() => {
    if (!previewRequested || adminMode) return;
    const token = sessionStorage.getItem('wedding-admin-token');
    if (!token) {
      window.location.replace('/?admin=1');
      return;
    }
    fetch('/api/admin/submissions', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? setPreviewAuthorized(true) : Promise.reject())
      .catch(() => {
        sessionStorage.removeItem('wedding-admin-token');
        window.location.replace('/?admin=1');
      });
  }, [adminMode, previewRequested]);

  useEffect(() => {
    if (!composerOpen && !guideOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (composerOpen) setComposerOpen(false);
      else dismissGuide();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', close);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', close); };
  }, [composerOpen, guideOpen]);

  if (!adminMode && !eventCode) return <GuestbookInvitation />;
  if (previewRequested && !adminMode && !previewAuthorized) return <main className="flex min-h-screen items-center justify-center bg-[#EEF1EC]"><div className="text-center"><LoaderCircle className="mx-auto h-6 w-6 animate-spin text-sage-700" /><p className="mt-3 font-montserrat text-[9px] font-bold uppercase tracking-[0.18em] text-sage-500">Checking admin access</p></div></main>;

  return (
    <main id="section-guestbook" className="relative min-h-screen overflow-hidden bg-[#EEF1EC] px-4 pb-20 pt-5 sm:px-6 sm:pt-8">
      <div className="pointer-events-none absolute inset-0 opacity-55 [background:radial-gradient(circle_at_12%_8%,#fff_0,transparent_28%),radial-gradient(circle_at_88%_20%,#e8d8dc_0,transparent_24%),radial-gradient(circle_at_50%_90%,#cbd8ca_0,transparent_35%)]" />
      <div className={`relative mx-auto ${wallMode ? 'max-w-[1600px]' : 'max-w-6xl'}`}>
        <header className="mb-8 flex items-center justify-between rounded-full border border-sage-200/70 bg-white/70 px-4 py-2.5 backdrop-blur sm:px-5">
          <a href={previewRequested ? '/?admin=1' : wallMode ? `/?guestbook=${eventCode}` : '/'} aria-label={previewRequested ? 'Back to admin dashboard' : wallMode ? 'Back to guest form and wedding wall' : 'Back to wedding invitation'} className="flex h-9 w-9 items-center justify-center rounded-full text-sage-700 transition hover:bg-sage-100"><ArrowLeft className="h-4 w-4" /></a>
          <div className="text-center"><p className="font-script text-2xl text-sage-800">Vinicius & Irish</p><p className="-mt-1 font-montserrat text-[8px] font-bold uppercase tracking-[0.25em] text-sage-500">Wedding memories</p></div>
          {!adminMode && !wallMode ? <a href={`/?guestbook=${eventCode}&wall=1`} title="Open projector view" aria-label="Open projector view" className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-50 text-sage-700 transition hover:bg-sage-100"><Camera className="h-4 w-4" /></a> : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-wine-50 text-wine-700"><Heart className="h-4 w-4 fill-wine-200" /></span>}
        </header>

        {adminMode ? <AdminPanel /> : wallMode ? (schedule && (schedule.wallVisible || previewAuthorized) ? (
          <section>
            <div className="mb-7 text-center"><p className="font-montserrat text-xs font-bold uppercase tracking-[0.32em] text-sage-600">Live from our celebration</p><h1 className="mt-2 font-script text-6xl text-sage-900 sm:text-8xl">Love, shared in the moment</h1></div>
            <WeddingWall projector />
          </section>
        ) : schedule ? <WallScheduleNotice schedule={schedule} eventCode={eventCode!} /> : null) : (
          <>
            <div className="mb-6 text-center">
              <p className="font-montserrat text-[10px] font-bold uppercase tracking-[0.28em] text-sage-600">August 12, 2026 · Shizuoka</p>
              <h1 className="mt-2 font-serif text-4xl font-semibold text-sage-900 sm:text-5xl">Our day, through your eyes</h1>
              <p className="mx-auto mt-3 max-w-xl font-serif text-lg italic text-sage-600">Post a photo, leave a note, and help us keep every little moment.</p>
            </div>
            {schedule && (schedule.submissionsOpen || previewAuthorized ? (
              <>
                <div className="mb-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button type="button" onClick={() => setComposerOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-sage-800 px-6 py-3.5 font-montserrat text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5 hover:bg-sage-700 focus:outline-none focus:ring-4 focus:ring-sage-200"><MessageCircleHeart className="h-4 w-4" /> Share a memory</button>
                  <span className="text-xs text-sage-500">A message is enough · photos are optional</span>
                  <button type="button" onClick={() => setGuideOpen(true)} className="border-b border-sage-400/60 pb-0.5 text-xs font-medium text-sage-600 transition hover:border-sage-700 hover:text-sage-800">How it works</button>
                </div>
                <div className="w-full rounded-[1.5rem] border border-sage-200/70 bg-white/55 p-5 backdrop-blur sm:p-8"><WeddingWall compact /></div>
                <AnimatePresence>
                  {guideOpen && (
                    <motion.div className="fixed inset-0 z-[60] flex items-end justify-center bg-sage-950/35 p-0 backdrop-blur-sm sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) dismissGuide(); }} role="dialog" aria-modal="true" aria-labelledby="guestbook-guide-title">
                      <motion.div initial={{ y: 30, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }} className="relative w-full max-w-2xl rounded-t-[1.75rem] bg-[#F9FAF7] px-6 pb-7 pt-8 sm:rounded-[1.75rem] sm:px-9 sm:py-9">
                        <button type="button" onClick={dismissGuide} aria-label="Close guide" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-sage-500 transition hover:bg-sage-100"><X className="h-4 w-4" /></button>
                        <p className="font-montserrat text-[9px] font-bold uppercase tracking-[0.24em] text-wine-600">A little piece of our day</p>
                        <h2 id="guestbook-guide-title" className="mt-2 font-serif text-3xl text-sage-900 sm:text-4xl">Welcome to our wedding wall</h2>
                        <p className="mt-2 max-w-lg font-serif italic text-sage-600">Share a message, a photo, or simply enjoy the memories everyone leaves here.</p>
                        <ol className="mt-7 grid gap-3 sm:grid-cols-3">
                          <li className="rounded-2xl border border-sage-200 bg-white p-4"><MessageCircleHeart className="h-5 w-5 text-wine-600" /><p className="mt-3 font-serif text-lg text-sage-900">Write a message</p><p className="mt-1 text-xs leading-relaxed text-sage-500">Add your name and a wish for the couple.</p></li>
                          <li className="rounded-2xl border border-sage-200 bg-white p-4"><ImagePlus className="h-5 w-5 text-wine-600" /><p className="mt-3 font-serif text-lg text-sage-900">Add photos</p><p className="mt-1 text-xs leading-relaxed text-sage-500">Choose up to three—or skip this step.</p></li>
                          <li className="rounded-2xl border border-sage-200 bg-white p-4"><Eye className="h-5 w-5 text-wine-600" /><p className="mt-3 font-serif text-lg text-sage-900">See the celebration</p><p className="mt-1 text-xs leading-relaxed text-sage-500">Your memory can join the live wedding wall.</p></li>
                        </ol>
                        <button type="button" onClick={() => { dismissGuide(); setComposerOpen(true); }} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage-800 px-6 py-3.5 font-montserrat text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-sage-700 focus:outline-none focus:ring-4 focus:ring-sage-200"><Sparkles className="h-4 w-4" /> Share a memory</button>
                      </motion.div>
                    </motion.div>
                  )}
                  {composerOpen && (
                    <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-sage-950/35 p-0 backdrop-blur-sm sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setComposerOpen(false); }} role="dialog" aria-modal="true" aria-label="Share a wedding memory">
                      <motion.div initial={{ y: 35, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 35, opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }} className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[1.75rem] bg-white sm:rounded-[1.75rem]">
                        <button type="button" onClick={() => setComposerOpen(false)} aria-label="Close memory form" className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-sage-50 text-sage-600 transition hover:bg-sage-100"><X className="h-4 w-4" /></button>
                        <GuestForm eventCode={eventCode!} />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : <><ScheduleNotice schedule={schedule} />{schedule.wallVisible && <WeddingWall />}</>)}
          </>
        )}
      </div>
    </main>
  );
}
