const PALETTE: [string, string][] = [
  ["#2f5eff", "#0b0c10"],
  ["#1e46e0", "#121319"],
  ["#111319", "#2f5eff"],
  ["#8e8e93", "#1c1c1e"],
  ["#a41e2f", "#0b0c10"],
  ["#2a2c8f", "#0b0c10"],
  ["#1b1d26", "#2f5eff"],
  ["#0a63c9", "#0b0c10"],
  ["#c9cbd1", "#3a3d47"],
  ["#5b2fe0", "#0b0c10"],
  ["#12395e", "#0b0c10"],
  ["#9ea1a8", "#26282e"],
]

/** Deterministic gradient pair for a given seed string (e.g. product slug or brand). */
export function productGradient(seed: string): { from: string; to: string } {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  const [from, to] = PALETTE[hash % PALETTE.length]
  return { from, to }
}
