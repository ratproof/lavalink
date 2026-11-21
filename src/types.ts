export interface LavalinkStats {
  players: number;
  playingPlayers: number;
  uptime: number;
  memory: { free: number; used: number; allocated: number; reservable: number };
  cpu: { cores: number; systemLoad: number; lavalinkLoad: number };
  frameStats: { sent: number; nulled: number; deficit: number } | null;
}

export interface LavalinkInfo {
  version: { semver: string; major: number; minor: number; patch: number; preRelease: string | null; build: string | null };
  buildTime: number;
  git: { branch: string; commit: string; commitTime: number };
  jvm: string;
  lavaplayer: string;
  sourceManagers: string[];
  filters: string[];
  plugins: { name: string; version: string }[];
}

export interface PlayerRow {
  guildId: string;
  title: string | null;
  author: string | null;
  isStream: boolean;
  length: number;
  position: number;
  paused: boolean;
  volume: number;
  connected: boolean;
  ping: number;
}

export interface NodeResponse {
  online: boolean;
  latency: number | null;
  checkedAt: number;
  stats: LavalinkStats | null;
  info: LavalinkInfo | null;
  players: PlayerRow[] | null;
  error?: string;
}
