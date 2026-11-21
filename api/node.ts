import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Proxy for the Lavalink REST api. The password and the node address stay on
 * the server, the browser only gets the fields below.
 */

const TIMEOUT_MS = 4000;

// Fallbacks used when the env vars are not set in Vercel. Keep this repo private.
const DEFAULT_URL = "https://audio.stains.rocks";
const DEFAULT_PASSWORD = "youshallnotpass";

async function lavalink<T>(path: string): Promise<{ data: T; ms: number }> {
  const base = (process.env.LAVALINK_URL || DEFAULT_URL).replace(/\/+$/, "");
  const start = Date.now();
  const res = await fetch(base + path, {
    headers: { Authorization: process.env.LAVALINK_PASSWORD || DEFAULT_PASSWORD },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`${path} returned ${res.status}`);
  return { data: (await res.json()) as T, ms: Date.now() - start };
}

interface RawPlayer {
  guildId: string;
  track: { info: { title: string; author: string; length: number; isStream: boolean } } | null;
  volume: number;
  paused: boolean;
  state: { connected: boolean; ping: number; position: number };
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "s-maxage=4, stale-while-revalidate=10");

  try {
    const [stats, info] = await Promise.all([
      lavalink<unknown>("/v4/stats"),
      lavalink<unknown>("/v4/info"),
    ]);

    let players: unknown = null;
    const sessionId = process.env.LAVALINK_SESSION_ID;
    if (sessionId) {
      try {
        const raw = await lavalink<RawPlayer[]>(`/v4/sessions/${encodeURIComponent(sessionId)}/players`);
        // Only safe fields. The raw player also holds the voice token.
        players = raw.data.map((p) => ({
          guildId: p.guildId,
          title: p.track?.info.title ?? null,
          author: p.track?.info.author ?? null,
          isStream: p.track?.info.isStream ?? false,
          length: p.track?.info.length ?? 0,
          position: p.state.position,
          paused: p.paused,
          volume: p.volume,
          connected: p.state.connected,
          ping: p.state.ping,
        }));
      } catch {
        players = null;
      }
    }

    res.status(200).json({
      online: true,
      latency: stats.ms,
      checkedAt: Date.now(),
      stats: stats.data,
      info: info.data,
      players,
    });
  } catch (err) {
    res.status(200).json({
      online: false,
      latency: null,
      checkedAt: Date.now(),
      stats: null,
      info: null,
      players: null,
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
