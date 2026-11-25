/*
 * Configuração da cena da fogueira: medidas e tempos da chaleira e dos copos.
 * As medidas estão em unidades do desenho (o viewBox do SVG); os ângulos, em graus.
 */

/** Um ponto ou deslocamento no desenho. */
export interface Point {
  x: number;
  y: number;
}

/**
 * Chaleira:
 * - `pivot`: centro do corpo, em volta do qual ela inclina; `spout`: ponta do bico em relação a ele.
 * - `bounds`: até onde dá para arrastar, em relação ao gancho.
 * - `holdEase` / `travelEase`: rapidez com que segue a mão / vai e volta sozinha.
 * - `spring` / `damping`: mola da inclinação; `nudge`: balanço quando não há mais o que servir.
 * - `clickSlop`: até essa distância, soltar conta como clique (e não como arrasto).
 */
export const KETTLE = {
  pivot: { x: 280, y: 312 },
  spout: { x: -57, y: -24 },
  bounds: { minX: -190, maxX: 180, minY: -110, maxY: 50 },
  holdEase: 18,
  travelEase: 5,
  spring: 120,
  damping: 13,
  nudge: 60,
  clickSlop: 5,
} as const;

/** Copos: posição (x) de cada um, a base no toco, a altura e o espaço interno para o café. */
export const GLASS = { xs: [132, 168], baseY: 406, height: 32, bottom: 3, depth: 25 } as const;

/**
 * Servir:
 * - `tilt`: inclinação da chaleira; o café só cai depois de passar de `streamFrom`.
 * - `gap`: altura do bico acima da boca do copo.
 * - `reachX` / `reachY`: distância em que o copo "puxa" a chaleira; `near`: quando ela começa a inclinar.
 * - `fillS`: tempo para encher um copo.
 */
export const POUR = {
  tilt: -40,
  streamFrom: -28,
  gap: 34,
  reachX: 18,
  reachY: 45,
  near: 10,
  fillS: 1.5,
} as const;

/** Ponta do bico, em relação ao centro da chaleira, com ela inclinada `tilt` graus. */
export function spoutAt(tilt: number): Point {
  const angle = (tilt * Math.PI) / 180;
  const { x, y } = KETTLE.spout;
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
  };
}

/** Deslocamento da chaleira (em relação ao gancho) para servir o copo `i`. */
export function pourOffset(i: number): Point {
  const tip = spoutAt(POUR.tilt);
  return {
    x: GLASS.xs[i] - tip.x - KETTLE.pivot.x,
    y: GLASS.baseY - GLASS.height - POUR.gap - tip.y - KETTLE.pivot.y,
  };
}
