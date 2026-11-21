import { useEffect, useState } from "react";
import type { NodeResponse } from "./types";

const POLL_MS = 5000;

export function useNode() {
  const [data, setData] = useState<NodeResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (document.hidden) return;
      try {
        const res = await fetch("/api/node");
        const json = (await res.json()) as NodeResponse;
        if (!alive) return;
        setData(json);
        setFailed(false);
      } catch {
        if (alive) setFailed(true);
      }
    }

    load();
    const id = setInterval(load, POLL_MS);
    document.addEventListener("visibilitychange", load);
    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", load);
    };
  }, []);

  return { data, failed };
}
