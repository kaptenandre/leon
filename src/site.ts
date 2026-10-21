// All artist content lives here. Edit this file to swap release, links and copy.

export type Link = { label: string; href: string };

export type Release = {
  title: string;
  /** "Single" | "EP" | "Album" */
  kind: string;
  /** Exact moment it goes live (ISO, UTC). Before this the CTA reads "Pre-save". */
  outAt: string;
  /** Local release date (YYYY-MM-DD, Europe/Stockholm), used for "Out today". */
  releaseDate: string;
  /** Label shown before release, e.g. "Out 7 November". */
  upcomingLabel: string;
  /** Smart link (pre-save / listen). Falls back to the first platform link. */
  smartLink?: string;
  video?: string;
  /** Release-specific platform links (optional, not shown on the page). */
  platforms?: Link[];
};

export type Background = {
  image?: string;
  video?: { webm?: string; mp4?: string; mobile?: string; poster?: string };
};

export const site = {
  name: "LÉON",
  url: "https://leon.site",
  description: "Welcome to the official website for LÉON",
  ogImage: "/og.jpg",

  /** Full-bleed background. Video wins over image when both are set. */
  background: {
    video: { mp4: "/video/bg-1080.mp4", mobile: "/video/bg-mobile.mp4", poster: "/video/bg-poster.jpg" },
  } as Background,

  release: {
    title: "Dirt",
    kind: "Single",
    outAt: "2023-11-09T23:00:00.000Z",
    releaseDate: "2023-11-10",
    upcomingLabel: "Out 10 November",
  } as Release,

  /** Artist-level streaming profiles. */
  streaming: [
    { label: "Spotify", href: "https://open.spotify.com/artist/4SqTiwOEdYrNayaGMkc7ia" },
    { label: "Apple Music", href: "https://music.apple.com/se/artist/l%C3%A9on/1065692205" },
    { label: "Deezer", href: "https://www.deezer.com/artist/8005464" },
    { label: "SoundCloud", href: "https://soundcloud.com/itsleonleon" },
    // TODO: Tidal, YouTube Music, Amazon Music
  ] as Link[],

  socials: [
    { label: "Instagram", href: "https://www.instagram.com/leon/" },
    { label: "Facebook", href: "https://www.facebook.com/itsleonmusic" },
    { label: "YouTube", href: "https://www.youtube.com/channel/UC8hod44yQ-t8eQuXxeK5-Yw" },
    { label: "Reddit", href: "https://www.reddit.com/r/itsleonleon/" },
    // TODO: TikTok
  ] as Link[],

  contact: [
    { label: "Management", href: "mailto:oskar@arketyp.se,ella@arketyp.se" },
    { label: "Booking EU", href: "mailto:tessie.lammle@the.team" },
    { label: "Booking Americas & ROW", href: "mailto:ryan.soroka@the.team,twindish@the.team" },
  ] as Link[],

  newsletter: {
    title: "Join the community",
    success: "You’re in. Talk soon.",
    consent:
      "By signing up you agree to receive email and/or SMS updates from LÉON. Unsubscribe at any time. Message & data rates may apply.",
  },
};
