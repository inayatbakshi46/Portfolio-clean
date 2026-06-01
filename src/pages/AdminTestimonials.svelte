<script lang="ts">
import { supabase } from '../lib/supabase';
  import { onMount } from 'svelte';
  import { storage, type Testimonial, type Screenplay, type SiteContent, DEFAULT_CONTENT } from '../lib/storage';

  // Auth
  let isAuthenticated = false;
  let passphrase = "";
  let authError = false;

  // Active tab
  type Tab = 'screenplays' | 'voices' | 'content';
  let activeTab: Tab = 'screenplays';

  // Data
  let testimonials: Testimonial[] = [];
  let screenplays: Screenplay[] = [];
  let content: SiteContent = { ...DEFAULT_CONTENT };

  // Forms
  let newTestimonial = { name: '', role: '', quote: '' };
  let newScreenplay = { title: '', genre: '', logline: '', status: 'Development' as Screenplay['status'], ctaText: 'Read Script', builtInPoster: '' as Screenplay['builtInPoster'],posterUrl: '',
  screenplayUrl: '' };
  let editingScreenplayId: string | null = null;
  let editingScreenplay: Screenplay | null = null;

  let toast = '';

  

  async function loadAll() {
  const [testimonialsRes, screenplaysRes, contentRes] = await Promise.all([
    supabase.from('testimonials').select('*'),
    supabase.from('screenplays').select('*'),
    supabase.from('site_content').select('*').single()
  ]);

  // console.log("SCREENPLAYS RAW:", screenplaysRes);

  // if (testimonialsRes.error) console.log(testimonialsRes.error);
  // if (screenplaysRes.error) console.log(screenplaysRes.error);
  // if (contentRes.error) console.log(contentRes.error);

  testimonials = testimonialsRes.data ?? [];
  screenplays = screenplaysRes.data ?? [];
  content = contentRes.data ?? DEFAULT_CONTENT;
}

  function showToast(msg: string) {
    toast = msg;
    setTimeout(() => toast = '', 3000);
  }

  // Auth
  async function handleLogin(e: Event) {
  e.preventDefault();

  const { data, error } = await supabase
  .from('admin_config')
  .select('passphrase');

if (error) {
  console.log(error);
  return;
}
const stored = data?.[0]?.passphrase;
if (passphrase === stored) {
  
  isAuthenticated = true;
  loadAll();
} else {
  authError = true;
}
}

  function handleLogout() {
    sessionStorage.removeItem('ib_admin_auth');
    isAuthenticated = false;
    passphrase = '';
  }

  // Testimonials
  async function addTestimonial(e: Event) {
  e.preventDefault();

  const { data, error } = await supabase
    .from('testimonials')
    .insert([{
      name: newTestimonial.name.toUpperCase(),
      role: newTestimonial.role,
      quote: newTestimonial.quote
    }])
    .select();

  if (error) {
    console.log(error);
    return;
  }

  testimonials = [...testimonials, data[0]];
  newTestimonial = { name: '', role: '', quote: '' };
}

  async function deleteTestimonial(id: string) {
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);

  if (error) {
    console.log(error);
    return;
  }

  testimonials = testimonials.filter(t => t.id !== id);
}

  // Screenplays
  async function addScreenplay(e: Event) {
  e.preventDefault();

  const { data, error } = await supabase
    .from('screenplays')
    .insert([
      {
        title: newScreenplay.title,
        genre: newScreenplay.genre,
        logline: newScreenplay.logline,
        status: newScreenplay.status,
        ctatext: newScreenplay.ctaText,
        builtinposter: newScreenplay.builtInPoster,
        posterurl: newScreenplay.posterUrl,
        screenplayurl: newScreenplay.screenplayUrl
      }
    ])
    .select(); // important

  if (error) {
    console.log(error);
    return;
  }

  // update UI instantly
  screenplays = [...screenplays, data[0]];

  // reset form
  newScreenplay = {
    title: '',
    genre: '',
    logline: '',
    status: 'Development',
    ctaText: 'Read Script',
    builtInPoster: '',
    posterUrl: '',
    screenplayUrl: ''
  };

  showToast('Screenplay added to database');
}

  function startEditScreenplay(s: Screenplay) {
    editingScreenplayId = s.id;
    editingScreenplay = { ...s };
  }

  async function saveEditScreenplay() {
  if (!editingScreenplay || !editingScreenplayId) return;

  const { error } = await supabase
    .from('screenplays')
    .update({
      title: editingScreenplay.title,
      genre: editingScreenplay.genre,
      logline: editingScreenplay.logline,
      status: editingScreenplay.status,
      ctatext: editingScreenplay.ctaText,
      builtinposter: editingScreenplay.builtinPoster,
      posterurl: editingScreenplay.posterUrl,
      screenplayurl: editingScreenplay.screenplayUrl
    })
    .eq('id', editingScreenplayId);

  if (error) {
    console.log(error);
    return;
  }

  // update UI
  screenplays = screenplays.map(s =>
    s.id === editingScreenplayId ? editingScreenplay : s
  );

  editingScreenplayId = null;
  editingScreenplay = null;

  showToast('Screenplay updated');
}

  function cancelEdit() {
    editingScreenplayId = null;
    editingScreenplay = null;
  }

  async function deleteScreenplay(id: string) {
  const { error } = await supabase
    .from('screenplays')
    .delete()
    .eq('id', id);

  if (error) {
    console.log(error);
    return;
  }

  // update UI
  screenplays = screenplays.filter(s => s.id !== id);

  showToast('Screenplay deleted');
}

  // Content
async function saveContent(e: Event) {
  e.preventDefault();

  const { error } = await supabase
    .from('site_content')
    .update({
      herotagline: content.heroTagline,
      aboutbio: content.aboutBio,
      aboutquote: content.aboutQuote,
      countscreenplays: content.countScreenplays,
      countshortfilms: content.countShortFilms,
      countconcepts: content.countConcepts,
      countsamples: content.countSamples,
      contactemail: content.contactEmail,
      linkedinurl: content.linkedinUrl,
      instagramurl: content.instagramUrl,
      discordurl: content.discordUrl,
      letterboxdurl: content.letterboxdUrl,
      footerquote: content.footerQuote
    })
    .eq('id', 'ccc9e4cf-beb9-4ac8-bdbe-a16fe9aefb60');

  if (error) {
    console.log(error);
    return;
  }

  showToast('Content saved to Supabase');
}

  const STATUS_OPTIONS: Screenplay['status'][] = ['Completed', 'In Progress', 'Development'];
  const POSTER_OPTIONS = [
    { value: '', label: '— None (gradient) —' },
    { value: 'loop', label: 'Built-in: Loop' },
    { value: 'midnight', label: 'Built-in: Midnight Train' },
    { value: 'echoes', label: 'Built-in: Echoes' },
  ];
</script>

<div class="film-grain"></div>

<div class="min-h-screen bg-background text-foreground px-4 md:px-8 py-8 md:py-16">

  {#if !isAuthenticated}
    <!-- Login Gate -->
    <div class="max-w-sm mx-auto mt-24 border border-white/20 p-10 text-center">
      <div class="scene-heading mb-6">RESTRICTED</div>
      <h1 class="text-xl font-bold uppercase tracking-widest mb-10">Studio Access</h1>
      <form on:submit={handleLogin} class="space-y-6">
        <input
          type="password"
          bind:value={passphrase}
          placeholder="ENTER PASSPHRASE"
          autofocus
          class="w-full bg-transparent border-0 border-b border-white/30 focus:border-primary focus:ring-0 px-0 py-2 text-sm outline-none text-center uppercase tracking-widest placeholder:text-white/20"
          data-testid="input-admin-password"
        />
        {#if authError}
          <p class="text-red-500 text-xs uppercase tracking-widest animate-[shake_0.4s_ease-in-out]">ACCESS DENIED.</p>
        {/if}
        <button type="submit" class="border border-white/30 px-8 py-3 uppercase tracking-widest hover:bg-white hover:text-black transition-colors text-sm w-full" data-testid="button-enter">
          [ENTER]
        </button>
      </form>
    </div>

  {:else}
    <!-- Dashboard -->
    <div class="max-w-5xl mx-auto">

      <!-- Header -->
      <header class="flex justify-between items-start border-b border-white/20 pb-6 mb-10">
        <div>
          <div class="scene-heading mb-1">ADMIN — PRIVATE</div>
          <h1 class="text-2xl font-bold uppercase tracking-widest">Studio Dashboard</h1>
        </div>
        <div class="flex items-center gap-6">
          <a href="/" class="text-xs uppercase tracking-widest text-foreground/50 hover:text-white transition-colors">[VIEW SITE]</a>
          <button on:click={handleLogout} class="text-xs uppercase tracking-widest text-foreground/50 hover:text-white transition-colors" data-testid="button-logout">
            [SIGN OUT]
          </button>
        </div>
      </header>

      <!-- Toast -->
      {#if toast}
        <div class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-primary text-black text-xs uppercase tracking-widest px-6 py-3 z-50 animate-[fadeIn_0.3s_ease-out]">
          {toast}
        </div>
      {/if}

      <!-- Tabs -->
      <div class="flex gap-0 border-b border-white/20 mb-12">
        {#each ([['screenplays','Screenplays'],['voices','Voices'],['content','Content']] as const) as [id, label]}
          <button
            on:click={() => activeTab = id as Tab}
            class={`px-6 py-3 text-xs uppercase tracking-widest transition-colors border-b-2 -mb-[2px] ${activeTab === id ? 'border-primary text-primary' : 'border-transparent text-foreground/50 hover:text-white'}`}
            data-testid={`tab-${id}`}
          >
            {label}
          </button>
        {/each}
      </div>

      <!-- ===== TAB: SCREENPLAYS ===== -->
      {#if activeTab === 'screenplays'}
        <div class="space-y-12">

          <!-- Add Screenplay Form -->
          <div>
            <h2 class="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-6 border-b border-white/10 pb-3">Add Screenplay</h2>
            <form on:submit={addScreenplay} class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-xs uppercase tracking-widest text-foreground/50 mb-2">Title</label>
                <input type="text" bind:value={newScreenplay.title} required placeholder="e.g. The Waiting Room" class="input-field" data-testid="input-screenplay-title" />
              </div>
              <div>
                <label class="block text-xs uppercase tracking-widest text-foreground/50 mb-2">Genre</label>
                <input type="text" bind:value={newScreenplay.genre} required placeholder="e.g. Horror / Drama" class="input-field" data-testid="input-screenplay-genre" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-xs uppercase tracking-widest text-foreground/50 mb-2">Logline</label>
                <textarea bind:value={newScreenplay.logline} rows="2" required placeholder="One or two sentences." class="input-field resize-none" data-testid="input-screenplay-logline"></textarea>
              </div>
              <div>
                <label class="block text-xs uppercase tracking-widest text-foreground/50 mb-2">Status</label>
                <select bind:value={newScreenplay.status} class="input-field bg-background" data-testid="select-screenplay-status">
                  {#each STATUS_OPTIONS as s}<option value={s}>{s}</option>{/each}
                </select>
              </div>
              <div>
                <label class="block text-xs uppercase tracking-widest text-foreground/50 mb-2">CTA Button Text</label>
                <input type="text" bind:value={newScreenplay.ctaText} required placeholder="e.g. Read Script" class="input-field" data-testid="input-screenplay-cta" />
              </div>
              <div>
                <label class="block text-xs uppercase tracking-widest text-foreground/50 mb-2">Poster Image</label>
                <select bind:value={newScreenplay.builtInPoster} class="input-field bg-background" data-testid="select-screenplay-poster">
                  {#each POSTER_OPTIONS as p}<option value={p.value}>{p.label}</option>{/each}
                </select>
              </div>
              <div>
  <label class="block text-xs uppercase tracking-widest text-foreground/50 mb-2">
    Custom Poster URL (optional)
  </label>
  <input
    type="text"
    bind:value={newScreenplay.posterUrl}
    placeholder="https://image-link.jpg"
    class="input-field"
  />
  <div>
  <label class="block text-xs uppercase tracking-widest text-foreground/50 mb-2">
    Screenplay Link
  </label>
  <input
    type="text"
    bind:value={newScreenplay.screenplayUrl}
    placeholder="Google Drive / PDF link"
    class="input-field"
  />
</div>
</div>
              <div class="md:col-span-2">
                <button type="submit" class="border border-white/30 px-8 py-3 uppercase tracking-widest hover:bg-white hover:text-black transition-colors text-xs" data-testid="button-add-screenplay">
                  [ADD SCREENPLAY]
                </button>
              </div>
            </form>
          </div>

          <!-- Screenplay List -->
          <div>
            <h2 class="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-6 border-b border-white/10 pb-3">Live Screenplays ({screenplays.length})</h2>
            <div class="space-y-4">
              {#if screenplays.length === 0}
                <p class="text-sm text-foreground/40 italic">No screenplays found.</p>
              {/if}
              {#each screenplays as s (s.id)}
                {#if editingScreenplayId === s.id && editingScreenplay}
                  <!-- Edit form inline -->
                  <div class="border border-primary/40 p-6 space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="label-sm">Title</label>
                        <input type="text" bind:value={editingScreenplay.title} class="input-field" />
                      </div>
                      <div>
                        <label class="label-sm">Genre</label>
                        <input type="text" bind:value={editingScreenplay.genre} class="input-field" />
                      </div>
                      <div class="md:col-span-2">
                        <label class="label-sm">Logline</label>
                        <textarea bind:value={editingScreenplay.logline} rows="2" class="input-field resize-none"></textarea>
                      </div>
                      <div>
                        <label class="label-sm">Status</label>
                        <select bind:value={editingScreenplay.status} class="input-field bg-background">
                          {#each STATUS_OPTIONS as st}<option value={st}>{st}</option>{/each}
                        </select>
                      </div>
                      <div>
                        <label class="label-sm">CTA Text</label>
                        <input type="text" bind:value={editingScreenplay.ctaText} class="input-field" />
                      </div>
                      <div>
                        <label class="label-sm">Poster</label>
                        <select bind:value={editingScreenplay.builtInPoster} class="input-field bg-background">
                          {#each POSTER_OPTIONS as p}<option value={p.value}>{p.label}</option>{/each}
                        </select>
                      </div>
                    </div>
                    <div class="flex gap-4 pt-2">
                      <button on:click={saveEditScreenplay} class="border border-primary text-primary px-6 py-2 uppercase tracking-widest hover:bg-primary hover:text-black transition-colors text-xs">[SAVE]</button>
                      <button on:click={cancelEdit} class="border border-white/20 px-6 py-2 uppercase tracking-widest hover:border-white/50 transition-colors text-xs text-foreground/50">[CANCEL]</button>
                    </div>
                  </div>
                {:else}
                  <div class="group border border-white/10 p-5 hover:border-white/25 transition-colors flex items-center gap-6" data-testid={`screenplay-item-${s.id}`}>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-3 mb-1 flex-wrap">
                        <span class="font-bold uppercase tracking-widest text-sm">{s.title}</span>
                        <span class="text-xs text-primary uppercase tracking-widest">{s.genre}</span>
                        <span class={`text-[0.6rem] uppercase tracking-widest px-2 py-0.5 border ${s.status === 'Completed' ? 'border-primary text-primary' : 'border-white/20 text-white/50'}`}>{s.status}</span>
                      </div>
                      <p class="text-xs text-foreground/50 line-clamp-1">{s.logline}</p>
                    </div>
                    <div class="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button on:click={() => startEditScreenplay(s)} class="text-xs uppercase tracking-widest text-foreground/60 hover:text-white border border-white/20 px-3 py-1 hover:border-white/50 transition-colors" data-testid={`button-edit-${s.id}`}>[EDIT]</button>
                      <button on:click={() => deleteScreenplay(s.id)} class="text-xs uppercase tracking-widest text-red-500 border border-red-500/30 px-3 py-1 hover:border-red-500 transition-colors" data-testid={`button-delete-screenplay-${s.id}`}>[DELETE]</button>
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        </div>

      <!-- ===== TAB: VOICES ===== -->
      {:else if activeTab === 'voices'}
        <div class="grid md:grid-cols-2 gap-16">
          <!-- Add Form -->
          <div>
            <h2 class="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-6 border-b border-white/10 pb-3">Add Voice</h2>
            <form on:submit={addTestimonial} class="space-y-6">
              <div>
                <label class="label-sm">Character Name</label>
                <input type="text" bind:value={newTestimonial.name} required placeholder="e.g. ARJUN MEHTA" class="input-field uppercase" data-testid="input-testimonial-name" />
              </div>
              <div>
                <label class="label-sm">Role (Parenthetical)</label>
                <input type="text" bind:value={newTestimonial.role} required placeholder="e.g. Independent Film Director" class="input-field" data-testid="input-testimonial-role" />
              </div>
              <div>
                <label class="label-sm">Dialogue / Quote</label>
                <textarea bind:value={newTestimonial.quote} rows="4" required class="input-field resize-none" data-testid="input-testimonial-quote"></textarea>
              </div>
              <button type="submit" class="border border-white/30 px-6 py-2 uppercase tracking-widest hover:bg-white hover:text-black transition-colors text-xs w-full" data-testid="button-add-testimonial">
                [ADD TO SITE]
              </button>
            </form>
          </div>

          <!-- List -->
          <div>
            <h2 class="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-6 border-b border-white/10 pb-3">Live Voices ({testimonials.length})</h2>
            <div class="space-y-4">
              {#if testimonials.length === 0}
                <p class="text-sm text-foreground/40 italic">No voices added yet.</p>
              {/if}
              {#each testimonials as t (t.id)}
                <div class="group relative border border-white/10 p-5 hover:border-white/25 transition-colors" data-testid={`testimonial-item-${t.id}`}>
                  <button on:click={() => deleteTestimonial(t.id)} class="absolute top-3 right-3 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest" data-testid={`button-delete-testimonial-${t.id}`}>[X]</button>
                  <div class="font-bold uppercase tracking-[0.15em] text-sm mb-0.5">{t.name}</div>
                  <div class="text-[0.65rem] text-foreground/50 mb-3">({t.role})</div>
                  <p class="italic text-xs text-foreground/70 leading-relaxed">"{t.quote}"</p>
                </div>
              {/each}
            </div>
          </div>
        </div>

      <!-- ===== TAB: CONTENT ===== -->
      {:else if activeTab === 'content'}
        <form on:submit={saveContent} class="space-y-10">

          <!-- Hero -->
          <fieldset class="border border-white/10 p-6 space-y-4">
            <legend class="text-xs uppercase tracking-widest text-primary px-2">Hero</legend>
            <div>
              <label class="label-sm">Hero Subtitle / Tagline</label>
              <input type="text" bind:value={content.heroTagline} class="input-field" data-testid="input-hero-tagline" />
            </div>
          </fieldset>

          <!-- About -->
          <fieldset class="border border-white/10 p-6 space-y-4">
            <legend class="text-xs uppercase tracking-widest text-primary px-2">About Me</legend>
            <div>
              <label class="label-sm">Biography (supports line breaks)</label>
              <textarea bind:value={content.aboutBio} rows="6" class="input-field resize-y" data-testid="input-about-bio"></textarea>
            </div>
            <div>
              <label class="label-sm">Pull Quote</label>
              <input type="text" bind:value={content.aboutQuote} class="input-field" data-testid="input-about-quote" />
            </div>
          </fieldset>

          <!-- Portfolio Counts -->
          <fieldset class="border border-white/10 p-6 space-y-4">
            <legend class="text-xs uppercase tracking-widest text-primary px-2">Portfolio Counts</legend>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              {#each [['countScreenplays','Screenplays'],['countShortFilms','Short Films'],['countConcepts','Concepts'],['countSamples','Samples']] as [key, label]}
                <div>
                  <label class="label-sm">{label}</label>
                  <input type="number" min="0" bind:value={(content as Record<string, unknown>)[key]} class="input-field" data-testid={`input-count-${key}`} />
                </div>
              {/each}
            </div>
          </fieldset>

          <!-- Contact -->
          <fieldset class="border border-white/10 p-6 space-y-4">
            <legend class="text-xs uppercase tracking-widest text-primary px-2">Contact</legend>
            <div>
              <label class="label-sm">Email Address</label>
              <input type="email" bind:value={content.contactEmail} class="input-field" data-testid="input-contact-email" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="label-sm">LinkedIn URL</label>
                <input type="text" bind:value={content.linkedinUrl} class="input-field" data-testid="input-linkedin" />
              </div>
              <div>
                <label class="label-sm">Instagram URL</label>
                <input type="text" bind:value={content.instagramUrl} class="input-field" data-testid="input-instagram" />
              </div>
              <div>
                <label class="label-sm">Discord URL</label>
                <input type="text" bind:value={content.discordUrl} class="input-field" data-testid="input-discord" />
              </div>
              <div>
                <label class="label-sm">Letterboxd URL</label>
                <input type="text" bind:value={content.letterboxdUrl} class="input-field" data-testid="input-letterboxd" />
              </div>
            </div>
          </fieldset>

          <!-- Footer -->
          <fieldset class="border border-white/10 p-6">
            <legend class="text-xs uppercase tracking-widest text-primary px-2">Footer</legend>
            <div class="mt-4">
              <label class="label-sm">Footer Quote</label>
              <textarea bind:value={content.footerQuote} rows="2" class="input-field resize-none" data-testid="input-footer-quote"></textarea>
            </div>
          </fieldset>

          <button type="submit" class="border border-primary text-primary px-10 py-3 uppercase tracking-widest hover:bg-primary hover:text-black transition-colors text-sm" data-testid="button-save-content">
            [SAVE ALL CONTENT]
          </button>
        </form>
      {/if}

    </div>
  {/if}
</div>

<style>
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
  }
  :global(.input-field) {
    width: 100%;
    background: transparent;
    border: 0;
    border-bottom: 1px solid rgba(255,255,255,0.2);
    padding: 0.4rem 0;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.2s;
    color: inherit;
    font-family: inherit;
  }
  :global(.input-field:focus) { border-bottom-color: hsl(var(--primary)); }
  :global(.label-sm) {
    display: block;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: rgba(255,255,255,0.4);
    margin-bottom: 0.4rem;
  }
</style>
