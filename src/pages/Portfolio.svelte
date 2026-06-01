<script lang="ts">
  import { supabase } from '../lib/supabase';
import { onMount } from 'svelte';
import type { Testimonial, Screenplay, SiteContent } from '../lib/storage';
import { DEFAULT_CONTENT } from '../lib/storage';

  import heroBg from "../assets/hero-bg.png";
  import posterLoop from "../assets/poster-loop.png";
  import posterMidnight from "../assets/poster-midnight.png";
  import posterEchoes from "../assets/poster-echoes.png";

  const POSTER_MAP: Record<string, string> = {
    loop: posterLoop,
    midnight: posterMidnight,
    echoes: posterEchoes,
  };

  const GENRE_COLORS: Record<string, string> = {
    horror: '#1a0a0a',
    thriller: '#0a0a1a',
    mystery: '#0a1a1a',
    drama: '#0a1a0a',
    default: '#111111',
  };

  function getPosterBg(s: Screenplay): string {
    if (s.builtInPoster && POSTER_MAP[s.builtInPoster]) return '';
    const g = s.genre.toLowerCase();
    for (const k of Object.keys(GENRE_COLORS)) {
      if (g.includes(k)) return GENRE_COLORS[k];
    }
    return GENRE_COLORS.default;
  }

  let scrolled = false;
  let mobileMenuOpen = false;
  let testimonials: Testimonial[] = [];
  let screenplays: Screenplay[] = [];
  let content: SiteContent = { ...DEFAULT_CONTENT };
  let formStatus = '';
async function loadAll() {
  const [t, s, c] = await Promise.all([
    supabase.from('testimonials').select('*'),
    supabase.from('screenplays').select('*'),
    supabase.from('site_content').select('*').limit(1).single()
  ]);

  if (t.error) console.log('testimonials:', t.error);
  if (s.error) console.log('screenplays:', s.error);
  if (c.error) console.log('content:', c.error);

  testimonials = t.data ?? [];
  screenplays = (s.data ?? []).map(sp => ({
  ...sp,
  ctaText: sp.ctatext,
  builtInPoster: sp.builtinposter,
  posterUrl: sp.posterurl,
  screenplayUrl: sp.screenplayurl
}));
  
  if (c.data) {
  content = {
    heroTagline: c.data.herotagline ?? '',
    aboutBio: c.data.aboutbio ?? '',
    aboutQuote: c.data.aboutquote ?? '',
    countScreenplays: c.data.countscreenplays ?? 0,
    countShortFilms: c.data.countshortfilms ?? 0,
    countConcepts: c.data.countconcepts ?? 0,
    countSamples: c.data.countsamples ?? 0,
    contactEmail: c.data.contactemail ?? '',
    linkedinUrl: c.data.linkedinurl ?? '',
    instagramUrl: c.data.instagramurl ?? '',
    discordUrl: c.data.discordurl ?? '',
    letterboxdUrl: c.data.letterboxdurl ?? '',
    footerQuote: c.data.footerquote ?? ''
  };
}
}
 onMount(() => {
  const onScroll = () => {
    scrolled = window.scrollY > 50;
  };

  window.addEventListener('scroll', onScroll);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  loadAll(); // 🔥 THIS is the only data source now

  return () => {
    window.removeEventListener('scroll', onScroll);
    observer.disconnect();
  };
});

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleContactSubmit(e: Event) {
    e.preventDefault();
    formStatus = 'Message sent. Connection established.';
    setTimeout(() => {
      formStatus = '';
      (e.target as HTMLFormElement).reset();
    }, 4000);
  }

  function pad(n: number) { return String(n).padStart(2, '0'); }
</script>

<div class="film-grain min-h-screen"></div>

<!-- Navigation -->
<nav class={`fixed top-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'bg-background/97 border-b border-white/15 py-4' : 'bg-black/30 backdrop-blur-sm py-5'}`}>
  <div class="max-w-6xl mx-auto px-6 flex justify-between items-center text-xs uppercase tracking-[0.22em]">
    <button on:click={() => { window.scrollTo({top:0,behavior:'smooth'}); mobileMenuOpen = false; }} class="hero text-2xl font-bold hover:text-primary transition-colors">I.B.</button>

    <!-- Desktop links -->
    <div class="hidden md:flex gap-8">
      <button on:click={() => scrollTo('about')} class="hover:text-primary transition-colors">About</button>
      <button on:click={() => scrollTo('screenplays')} class="hover:text-primary transition-colors">Work</button>
      <button on:click={() => scrollTo('process')} class="hover:text-primary transition-colors">Process</button>
      <button on:click={() => scrollTo('contact')} class="hover:text-primary transition-colors">Contact</button>
    </div>

    <!-- Hamburger (mobile only) -->
    <button
      on:click={() => mobileMenuOpen = !mobileMenuOpen}
      class="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] group"
      aria-label="Toggle menu"
    >
      <span class={`block w-6 h-[1px] bg-current transition-all duration-300 origin-center ${mobileMenuOpen ? 'rotate-45 translate-y-[6px]' : ''}`}></span>
      <span class={`block w-6 h-[1px] bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
      <span class={`block w-6 h-[1px] bg-current transition-all duration-300 origin-center ${mobileMenuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`}></span>
    </button>
  </div>

  <!-- Mobile dropdown -->
  {#if mobileMenuOpen}
    <div class="md:hidden bg-background/98 border-t border-white/10 px-6 py-6 flex flex-col gap-6 text-xs uppercase tracking-[0.22em]">
      <button on:click={() => { scrollTo('about'); mobileMenuOpen = false; }} class="text-left hover:text-primary transition-colors">About</button>
      <button on:click={() => { scrollTo('screenplays'); mobileMenuOpen = false; }} class="text-left hover:text-primary transition-colors">Work</button>
      <button on:click={() => { scrollTo('process'); mobileMenuOpen = false; }} class="text-left hover:text-primary transition-colors">Process</button>
      <button on:click={() => { scrollTo('contact'); mobileMenuOpen = false; }} class="text-left hover:text-primary transition-colors">Contact</button>
    </div>
  {/if}
</nav>

<!-- Hero -->
<section class="relative h-screen w-full flex items-center justify-center letterbox overflow-hidden">
  <div class="absolute inset-0 z-0">
    <img src={heroBg} alt="Cinematic theater" class="w-full h-full object-cover" />
    <div class="absolute inset-0 bg-black/65"></div>
  </div>
  <div class="relative z-20 text-center px-6 max-w-4xl mx-auto animate-[fadeIn_2s_ease-out]">
    <h1 class="text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-[0.3em] mb-8">
      <span class="hero">I</span>nayat
      <span class="hero">B</span>akshi
    </h1>
    <p class="text-sm md:text-base italic text-foreground/75 mb-12 max-w-xl mx-auto leading-relaxed">
      {content.heroTagline}
    </p>
    <div class="flex flex-col md:flex-row gap-5 justify-center items-center text-xs">
      <button on:click={() => scrollTo('screenplays')} class="border border-white/30 px-8 py-3 uppercase tracking-widest hover:bg-white hover:text-black transition-colors" data-testid="button-read-work">[READ MY WORK]</button>
      <button on:click={() => scrollTo('contact')} class="border border-white/30 px-8 py-3 uppercase tracking-widest hover:bg-white hover:text-black transition-colors" data-testid="button-contact">[CONTACT ME]</button>
    </div>
  </div>
  <div class="absolute bottom-0 w-full h-[1px] bg-primary z-20"></div>
</section>

<!-- About -->
<section id="about" class="py-24 md:py-32 px-6 max-w-6xl mx-auto">
  <div class="reveal">
    <div class="scene-heading text-xs md:text-2xl mb-12">INT. ABOUT ME — DAY</div>
    <div class="grid md:grid-cols-2 gap-16 items-center">
      <div class="relative aspect-[3/4] w-full max-w-sm mx-auto border border-white/20 p-2">
        <div class="w-full h-full border border-white/20 flex items-center justify-center bg-card/20">
          <span class="text-6xl text-white/10 font-bold tracking-widest">I.B.</span>
        </div>
      </div>
      <div class="space-y-5 text-sm leading-relaxed text-foreground/85">
        {#each content.aboutBio.split('\n\n') as para}
          {#if para.trim()}
            <p>{para.trim()}</p>
          {/if}
        {/each}
        <div class="pt-8 border-t border-white/10">
          <p class="italic text-base text-foreground/70 leading-relaxed">"{content.aboutQuote}"</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Screenplays -->
<section id="screenplays" class="py-24 md:py-32 px-6 max-w-6xl mx-auto border-t border-white/10">
  <div class="reveal">
    <div class="scene-heading text-xs md:text-2xl mb-12">EXT. SCREENPLAYS — NIGHT</div>
    <div class="grid md:grid-cols-3 gap-8">
      {#each screenplays as s (s.id)}
        {@const posterSrc = s.posterUrl || (s.builtInPoster ? POSTER_MAP[s.builtInPoster] : null)}
        {@const bgColor = getPosterBg(s)}
        <div class="group border border-white/20 relative flex flex-col h-[500px] overflow-hidden" data-testid={`card-screenplay-${s.id}`}>
          <div class="absolute inset-0 z-0">
            {#if posterSrc}
              <img src={posterSrc} alt="{s.title} poster" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            {:else}
              <div class="w-full h-full" style="background-color: {bgColor}"></div>
            {/if}
            <div class="absolute inset-0 bg-black/80 group-hover:bg-black/70 transition-colors"></div>
          </div>
          <div class="relative z-10 p-6 flex flex-col h-full">
            <div class={`inline-block border text-[0.6rem] uppercase tracking-widest px-2 py-1 self-start mb-auto ${s.status === 'Completed' ? 'border-primary text-primary' : 'border-white/25 text-white/55'}`}>{s.status}</div>
            <div class="mt-auto">
              <h3 class="text-xl font-bold uppercase tracking-widest mb-2">{s.title}</h3>
              <div class="text-primary text-xs uppercase tracking-widest mb-4">{s.genre}</div>
              <p class="text-sm text-foreground/75 mb-6 line-clamp-3">{s.logline}</p>
              <a href={s.screenplayUrl} target="_blank" class="text-xs uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center gap-2">
                <span class="w-8 h-[1px] bg-current"></span> {s.ctaText}
              </a>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Portfolio Grid -->
<section class="py-24 md:py-32 px-6 max-w-6xl mx-auto border-t border-white/10">
  <div class="reveal">
    <div class="scene-heading text-xs md:text-2xl mb-12">INT. PORTFOLIO — DAY</div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      {#each [
        { label: 'Screenplays', count: content.countScreenplays, desc: 'Feature-length scripts' },
        { label: 'Short Films', count: content.countShortFilms, desc: 'Produced & unproduced' },
        { label: 'Concepts', count: content.countConcepts, desc: 'Treatments & pitches' },
        { label: 'Samples', count: content.countSamples, desc: 'Spec scenes' },
      ] as cat}
        <div class="border border-white/20 p-6 relative group hover:bg-white/5 transition-colors cursor-default">
          <span class="absolute top-4 right-4 text-5xl font-bold text-white/5 group-hover:text-primary/10 transition-colors">{pad(cat.count)}</span>
          <h4 class="font-bold uppercase tracking-widest mb-4 mt-8 text-sm">{cat.label}</h4>
          <p class="text-xs text-foreground/55">{cat.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Process -->
<section id="process" class="py-24 md:py-32 px-6 max-w-6xl mx-auto border-t border-white/10">
  <div class="reveal">
    <div class="scene-heading text-xs md:text-2xl mb-16">EXT. PROCESS — CONTINUOUS</div>
    <div class="relative">
      <div class="hidden md:block absolute top-[15px] left-0 w-full h-[1px] bg-white/15"></div>
      <div class="flex flex-col md:flex-row justify-between gap-10 md:gap-4 relative z-10">
        {#each ['Idea','Outline','Draft','Rewrite','Screenplay'] as step, i}
          <div class="flex md:flex-col items-center md:items-start gap-5 md:gap-4 w-full md:w-1/5">
            <div class="w-[30px] h-[30px] rounded-full bg-background border border-white/25 flex items-center justify-center shrink-0">
              <div class="w-[6px] h-[6px] rounded-full bg-primary"></div>
            </div>
            <div>
              <div class="text-xs text-primary mb-1 uppercase tracking-widest">0{i+1}</div>
              <h4 class="font-bold uppercase tracking-widest text-sm">{step}</h4>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>

<!-- Testimonials / Voices -->
<section class="py-24 md:py-32 px-6 max-w-4xl mx-auto border-t border-white/10">
  <div class="reveal">
    <div class="scene-heading text-xs md:text-2xl mb-16 text-center">INT. VOICES — NIGHT</div>
    <div class="space-y-14">
      {#each testimonials as t (t.id)}
        <div class="border-t border-white/10 pt-10" data-testid={`testimonial-${t.id}`}>
          <div class="text-center mb-5">
            <div class="font-bold uppercase tracking-[0.2em] text-sm">{t.name}</div>
            <div class="text-xs text-foreground/55 mt-1">({t.role})</div>
          </div>
          <p class="italic text-center text-sm md:text-base leading-relaxed text-foreground/80 max-w-2xl mx-auto px-6">
            "{t.quote}"
          </p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Contact -->
<section id="contact" class="py-24 md:p-32 px-6 max-w-6xl mx-auto border-t border-white/10">
  <div class="reveal">
    <div class="scene-heading text-xs md:text-2xl mb-12">INT. CONTACT — NIGHT</div>
    <div class="grid md:grid-cols-2 gap-16">
      <div>
        <h3 class="text-xl font-bold uppercase tracking-widest mb-6">Let's Connect</h3>
        <p class="text-sm text-foreground/70 mb-8 max-w-md leading-relaxed">
          Available for writing assignments, script doctoring, and creative collaborations.
        </p>
        <div class="mb-8">
          <a href="mailto:{content.contactEmail}" class="text-primary hover:text-white transition-colors tracking-widest uppercase text-sm" data-testid="link-email">{content.contactEmail}</a>
        </div>
        <div class="flex gap-6 text-xs uppercase tracking-widest">
          <a href={content.linkedinUrl} aria-label="LinkedIn" class="hover:text-primary transition-colors" data-testid="link-linkedin"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M12.51 8.796v1.697a3.738 3.738 0 0 1 3.288-1.684c3.455 0 4.202 2.16 4.202 4.97V19.5h-3.2v-5.072c0-1.21-.244-2.766-2.128-2.766-1.827 0-2.139 1.317-2.139 2.676V19.5h-3.19V8.796h3.168ZM7.2 6.106a1.61 1.61 0 0 1-.988 1.483 1.595 1.595 0 0 1-1.743-.348A1.607 1.607 0 0 1 5.6 4.5a1.601 1.601 0 0 1 1.6 1.606Z" clip-rule="evenodd"/>
  <path d="M7.2 8.809H4V19.5h3.2V8.809Z"/>
</svg>
</a>
          <a href={content.instagramUrl} aria-label="Instagram" class="hover:text-primary transition-colors" data-testid="link-instagram"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path fill="currentColor" fill-rule="evenodd" d="M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" clip-rule="evenodd"/>
</svg>
</a>
          <a href={content.discordUrl} aria-label="Discord" class="hover:text-primary transition-colors" data-testid="link-discord"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path d="M18.942 5.556a16.3 16.3 0 0 0-4.126-1.3 12.04 12.04 0 0 0-.529 1.1 15.175 15.175 0 0 0-4.573 0 11.586 11.586 0 0 0-.535-1.1 16.274 16.274 0 0 0-4.129 1.3 17.392 17.392 0 0 0-2.868 11.662 15.785 15.785 0 0 0 4.963 2.521c.41-.564.773-1.16 1.084-1.785a10.638 10.638 0 0 1-1.706-.83c.143-.106.283-.217.418-.331a11.664 11.664 0 0 0 10.118 0c.137.114.277.225.418.331-.544.328-1.116.606-1.71.832a12.58 12.58 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.064-2.595 17.286 17.286 0 0 0-2.973-11.59ZM8.678 14.813a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.918 1.918 0 0 1 1.8 2.047 1.929 1.929 0 0 1-1.8 2.045Zm6.644 0a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.919 1.919 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Z"/>
</svg>
</a>
          <a href={content.letterboxdUrl} aria-label="Letterboxd" class="hover:text-primary transition-colors" data-testid="link-letterboxd"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-brand-letterboxd"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M6 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M10 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M14 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /></svg></a>
        </div>
      </div>
      <div>
        <form on:submit={handleContactSubmit} class="space-y-8">
          {#if formStatus}
            <div class="text-primary text-xs uppercase tracking-widest italic">{formStatus}</div>
          {/if}
          <div>
            <label for="name" class="block text-xs uppercase tracking-widest text-foreground/50 mb-2">Name</label>
            <input type="text" id="name" required class="w-full bg-transparent border-0 border-b border-white/25 focus:border-primary px-0 py-2 text-sm outline-none transition-colors" data-testid="input-name" />
          </div>
          <div>
            <label for="email" class="block text-xs uppercase tracking-widest text-foreground/50 mb-2">Email</label>
            <input type="email" id="email" required class="w-full bg-transparent border-0 border-b border-white/25 focus:border-primary px-0 py-2 text-sm outline-none transition-colors" data-testid="input-email" />
          </div>
          <div>
            <label for="message" class="block text-xs uppercase tracking-widest text-foreground/50 mb-2">Message</label>
            <textarea id="message" rows="4" required class="w-full bg-transparent border-0 border-b border-white/25 focus:border-primary px-0 py-2 text-sm outline-none transition-colors resize-none" data-testid="input-message"></textarea>
          </div>
          <button type="submit" class="border border-white/30 px-8 py-3 uppercase tracking-widest hover:bg-white hover:text-black transition-colors text-xs" data-testid="button-submit">
            [SEND MESSAGE]
          </button>
        </form>
      </div>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="py-12 px-6 text-center border-t border-white/10">
  <p class="italic text-foreground/50 mb-8 text-sm max-w-xl mx-auto leading-relaxed">
    "{content.footerQuote}"
  </p>
  <p class="text-[0.6rem] uppercase tracking-widest text-white/20">
    © {new Date().getFullYear()} Inayat Bakshi. All rights reserved.
  </p>
</footer>

<style>
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
