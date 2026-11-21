export interface SourceMeta {
  id: string;
  name: string;
  /** What you can put into the player for this source. */
  note: string;
  /** Search prefix, if the source supports text search. */
  prefix?: string;
}

/** Sources people usually care about. Shown as enabled or not enabled. */
export const POPULAR: SourceMeta[] = [
  { id: "youtube", name: "YouTube", note: "Links and search", prefix: "ytsearch:" },
  { id: "spotify", name: "Spotify", note: "Tracks, albums, playlists, artists", prefix: "spsearch:" },
  { id: "applemusic", name: "Apple Music", note: "Tracks, albums, playlists", prefix: "amsearch:" },
  { id: "deezer", name: "Deezer", note: "Tracks, albums, playlists", prefix: "dzsearch:" },
  { id: "soundcloud", name: "SoundCloud", note: "Links and search", prefix: "scsearch:" },
  { id: "yandexmusic", name: "Yandex Music", note: "Tracks, albums, playlists", prefix: "ymsearch:" },
  { id: "tidal", name: "Tidal", note: "Tracks, albums, playlists", prefix: "tdsearch:" },
  { id: "bandcamp", name: "Bandcamp", note: "Links only" },
  { id: "twitch", name: "Twitch", note: "Live streams" },
  { id: "vimeo", name: "Vimeo", note: "Links only" },
  { id: "http", name: "Direct links", note: "Audio file and stream urls" },
];

const NAMES: Record<string, string> = {
  nico: "Niconico",
  getyarn: "Yarn",
  local: "Local files",
  flowerytts: "Flowery TTS",
  vkmusic: "VK Music",
  qobuz: "Qobuz",
  jiosaavn: "JioSaavn",
  mixcloud: "Mixcloud",
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

/** Split the node's source managers into popular (with on/off) and everything else. */
export function resolveSources(enabled: string[]) {
  const on = new Set(enabled.map(norm));
  const popular = POPULAR.map((s) => ({ ...s, enabled: on.has(s.id) }));
  const known = new Set(POPULAR.map((s) => s.id));
  const other = enabled.filter((e) => !known.has(norm(e))).map((e) => NAMES[norm(e)] ?? e);
  return { popular, other };
}
