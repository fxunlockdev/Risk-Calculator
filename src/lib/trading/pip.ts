import {
  CRYPTO_PAIRS,
  INDICES,
  COMMODITIES,
} from "@/lib/constants/instruments";

// Fast lookup sets built once at module load.
const CRYPTO_SET = new Set<string>(CRYPTO_PAIRS);
const INDICES_SET = new Set<string>(INDICES);
const COMMODITIES_SET = new Set<string>(COMMODITIES);

// Gold, Silver, Platinum, Palladium → 1 pip = 0.01.
const METALS_POINT_01 = new Set<string>([
  "XAUUSD",
  "XAGUSD",
  "XPTUSD",
  "XPDUSD",
  "XAUEUR",
  "XAUGBP",
  "XAUJPY",
]);

const CRYPTO_SUFFIXES = ["USDT", "USDC", "BUSD", "BTC"] as const;

function isJpyPair(instrument: string): boolean {
  const upper = instrument.toUpperCase();
  // Only flag true forex JPY pairs — XAUJPY is handled by the metals table.
  if (METALS_POINT_01.has(upper)) return false;
  return upper.endsWith("JPY") && upper.length === 6;
}

function isCryptoPair(upper: string): boolean {
  if (CRYPTO_SET.has(upper)) return true;
  return CRYPTO_SUFFIXES.some((s) => upper.endsWith(s));
}

/**
 * Pip value = the price increment that counts as "one pip" for this instrument.
 *
 * Conventions:
 * - Forex major/cross: 0.0001
 * - Forex JPY pair:    0.01
 * - Metals:            0.01
 * - Crypto:            1
 * - Indices:           1
 * - Commodities:       0.01
 */
export function computePipValue(instrument: string): number {
  const upper = instrument.toUpperCase();

  if (METALS_POINT_01.has(upper)) return 0.01;
  if (isCryptoPair(upper)) return 1;
  if (INDICES_SET.has(upper)) return 1;
  if (COMMODITIES_SET.has(upper)) return 0.01;
  if (isJpyPair(upper)) return 0.01;

  return 0.0001;
}
