export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
}

export interface Screenplay {
  screenplayUrl: string | null | undefined;
  id: string;
  title: string;
  genre: string;
  logline: string;
  status: 'Completed' | 'In Progress' | 'Development';
  ctaText: string;

  builtInPoster: 'loop' | 'midnight' | 'echoes' | '';

  // optional external link (script / pdf / drive / etc.)
  linkUrl?: string;

  // optional custom poster (URL or base64)
  posterUrl?: string;
}

export interface SiteContent {
  heroTagline: string;
  aboutBio: string;
  aboutQuote: string;
  contactEmail: string;
  linkedinUrl: string;
  instagramUrl: string;
  letterboxdUrl?: string;
  discordUrl?: string;
  countScreenplays: number;
  countShortFilms: number;
  countConcepts: number;
  countSamples: number;
  footerQuote: string;
}

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  ];

export const DEFAULT_SCREENPLAYS: Screenplay[] = [
  
];

export const DEFAULT_CONTENT: SiteContent = {
  heroTagline: "A screenwriter moves through the liminal space between literature and cinema.",
  aboutBio: `With a background in English Literature, my work is driven by the structural rigor of prose and the visceral impact of the moving image. I am drawn to horror, mystery, thriller, and drama — genres that allow us to explore the dark corners of the human condition.\n\n"A script is a promise. It is the stillness before the projector whirs to life."`,
  aboutQuote: "The image is not a certain meaning, expressed by the director, but an entire world reflected in a drop of water.",
  contactEmail: "contact@inayatbakshi.com",
  linkedinUrl: "",
  instagramUrl: "",
  letterboxdUrl: "",
  discordUrl: "",
  countScreenplays: 0,
  countShortFilms: 0,
  countConcepts: 0,
  countSamples: 0,
  footerQuote: "The image is not a certain meaning, expressed by the director, but an entire world reflected in a drop of water. — Andrei Tarkovsky",
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback)) return (Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback) as T;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  testimonials: {
    load: () => load<Testimonial[]>('ib_testimonials', DEFAULT_TESTIMONIALS),
    save: (v: Testimonial[]) => save('ib_testimonials', v),
  },
  screenplays: {
    load: () => load<Screenplay[]>('ib_screenplays', DEFAULT_SCREENPLAYS),
    save: (v: Screenplay[]) => save('ib_screenplays', v),
  },
  content: {
    load: () => load<SiteContent>('ib_content', DEFAULT_CONTENT),
    save: (v: SiteContent) => save('ib_content', v),
  },
};
