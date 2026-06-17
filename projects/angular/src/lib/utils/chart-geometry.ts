/**
 * Pure, dependency-free geometry helpers shared by the chart components.
 *
 * Everything here is SSR-safe: no DOM, no `window`, no `Date`. Inputs and
 * outputs are plain numbers and strings so the functions are trivially unit
 * testable and reusable across line, bar, donut, sparkline and gauge charts.
 */

/** A point in SVG user space. */
export interface ChartPoint {
  x: number;
  y: number;
}

/** Result of {@link niceScale}: a rounded axis domain with evenly spaced ticks. */
export interface NiceScale {
  min: number;
  max: number;
  ticks: number[];
}

/** Clamp `value` into the inclusive `[min, max]` range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Round `value` to at most `decimals` significant fractional digits, dropping
 * floating-point noise (e.g. `0.30000000000000004` → `0.3`).
 */
export function roundTo(value: number, decimals = 6): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Round a candidate axis range/step to a visually "nice" 1/2/5×10ⁿ value. */
function niceNum(range: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / 10 ** exponent;
  let niceFraction: number;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;
  return niceFraction * 10 ** exponent;
}

/**
 * Compute a "nice" axis domain and evenly spaced ticks covering `[min, max]`.
 * Always returns at least two ticks and never loops infinitely on degenerate
 * (equal or inverted) inputs.
 *
 * @param maxTicks Upper bound on the number of ticks (≥ 2). Default 5.
 */
export function niceScale(min: number, max: number, maxTicks = 5): NiceScale {
  const safeTicks = Math.max(2, Math.floor(maxTicks));
  let lo = Math.min(min, max);
  let hi = Math.max(min, max);
  if (lo === hi) {
    // Degenerate range — pad symmetrically so we still draw a usable axis.
    const pad = Math.abs(lo) > 0 ? Math.abs(lo) * 0.5 : 1;
    lo -= pad;
    hi += pad;
  }
  const range = niceNum(hi - lo, false);
  const step = niceNum(range / (safeTicks - 1), true) || 1;
  const niceMin = Math.floor(lo / step) * step;
  const niceMax = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step * 0.5; v += step) {
    ticks.push(roundTo(v));
  }
  return { min: niceMin, max: niceMax, ticks };
}

/**
 * Build a linear mapping from a data domain to a pixel range.
 * Returns the identity-safe scale `(value) => pixel`.
 */
export function scaleLinear(
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
): (value: number) => number {
  const domainSpan = domainMax - domainMin || 1;
  const rangeSpan = rangeMax - rangeMin;
  return (value: number) => rangeMin + ((value - domainMin) / domainSpan) * rangeSpan;
}

/** Build an SVG path (`M`/`L`) through `points`. Empty input yields `''`. */
export function buildLinePath(points: ChartPoint[]): string {
  if (points.length === 0) return '';
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${roundTo(p.x, 2)} ${roundTo(p.y, 2)}`)
    .join(' ');
}

/**
 * Build a closed area path from `points` down to `baselineY`.
 * Used for area charts and sparkline fills.
 */
export function buildAreaPath(points: ChartPoint[], baselineY: number): string {
  if (points.length === 0) return '';
  const first = points[0];
  const last = points[points.length - 1];
  const top = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${roundTo(p.x, 2)} ${roundTo(p.y, 2)}`)
    .join(' ');
  return (
    `${top} L${roundTo(last.x, 2)} ${roundTo(baselineY, 2)} ` +
    `L${roundTo(first.x, 2)} ${roundTo(baselineY, 2)} Z`
  );
}

/** Convert a polar coordinate (degrees, 0° = 12 o'clock, clockwise) to cartesian. */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): ChartPoint {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

/**
 * Build a filled donut/pie slice path between two angles (clockwise, degrees).
 * Pass `innerRadius = 0` for a full pie slice.
 */
export function donutSlicePath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const sweep = endAngle - startAngle;
  // A full circle can't be expressed as a single arc — split into two halves.
  if (sweep >= 359.999) {
    const mid = startAngle + 180;
    return (
      donutSlicePath(cx, cy, outerRadius, innerRadius, startAngle, mid) +
      ' ' +
      donutSlicePath(cx, cy, outerRadius, innerRadius, mid, endAngle)
    );
  }
  const largeArc = sweep > 180 ? 1 : 0;
  const oStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const oEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  if (innerRadius <= 0) {
    return (
      `M${roundTo(cx, 2)} ${roundTo(cy, 2)} ` +
      `L${roundTo(oStart.x, 2)} ${roundTo(oStart.y, 2)} ` +
      `A${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${roundTo(oEnd.x, 2)} ${roundTo(oEnd.y, 2)} Z`
    );
  }
  const iEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const iStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  return (
    `M${roundTo(oStart.x, 2)} ${roundTo(oStart.y, 2)} ` +
    `A${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${roundTo(oEnd.x, 2)} ${roundTo(oEnd.y, 2)} ` +
    `L${roundTo(iEnd.x, 2)} ${roundTo(iEnd.y, 2)} ` +
    `A${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${roundTo(iStart.x, 2)} ${roundTo(iStart.y, 2)} Z`
  );
}

/** Build a stroked arc path (no fill) between two angles — used by the gauge. */
export function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return (
    `M${roundTo(start.x, 2)} ${roundTo(start.y, 2)} ` +
    `A${radius} ${radius} 0 ${largeArc} 1 ${roundTo(end.x, 2)} ${roundTo(end.y, 2)}`
  );
}

/**
 * Locale-aware number formatting via the `Intl` API (SSR-safe).
 * Falls back to `String(value)` if `Intl` is unavailable or throws.
 */
export function formatNumber(
  value: number,
  locale?: string,
  options?: Intl.NumberFormatOptions,
): string {
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return String(value);
  }
}
