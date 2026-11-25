/*
 * Configuração da cena da página principal: números, tamanhos e o elenco do trem.
 * Ajuste aqui velocidades, posições e quantidades sem mexer na lógica dos componentes.
 * Todas as medidas estão em unidades do palco (1440×900).
 */

// =====================================================================================
// Palco
// =====================================================================================

/** Palco do desktop: um pôster de 1440×900 unidades, escalado para caber na tela. */
export const STAGE = { width: 1440, height: 900 } as const;

/** Abaixo de 720px, mostra só uma janela de 400 unidades da cena, centrada em x=790. */
export const MOBILE = { breakpoint: 720, window: 400, centerX: 790, height: 880 } as const;

/**
 * Trecho da cena (em x, unidades do palco) que aparece na tela agora. Muda com o tamanho da tela:
 * em telas largas aparece mais do que 0..1440. Calculado em main-page.ts → layout().
 */
export interface StageView {
  minX: number;
  maxX: number;
}

/** O sol muda de lugar e tamanho no mobile para caber atrás do cartão da foto. */
export const SUN_TRANSFORM = {
  desktop: 'translate(1100 470)',
  mobile: 'translate(903 232) scale(.5)',
} as const;

/** Paralaxe: deslocamento máximo de cada camada (px) e inclinação máxima do cartão da foto (graus). */
export const PARALLAX = { far: [6, 3], mid: [14, 4], sun: [3, 2], cardTilt: [18, 14] } as const;

/** Fim da animação de entrada: só depois disso a paralaxe e o tiro perdido começam. */
export const SETTLE_MS = 2400;

/** Espera máxima pelas fontes antes de começar a entrada (evita trocar a fonte no meio da animação). */
export const FONT_TIMEOUT_MS = 900;

// =====================================================================================
// Trem
// =====================================================================================

/** Altura dos trilhos no palco. */
export const RAIL_Y = 640;

/**
 * Trem (x = traseira do último vagão):
 * - `speed`: velocidade de cruzeiro (unidades/s); `startX`: onde ele começa.
 * - `length`: comprimento total, da traseira ao limpa-trilhos.
 * - Some depois de passar `exitMargin` da borda direita da tela e volta pela esquerda, sempre fora
 *   da tela: em `reenterX` (ou mais longe, em telas largas) menos um sorteio de até `reenterJitter`.
 */
export const TRAIN = {
  speed: 38,
  startX: -260,
  length: 244,
  exitMargin: 40,
  reenterX: -900,
  reenterJitter: 600,
} as const;

/** Piuí: impulso extra de velocidade e quanto dele sobra depois de 1 segundo (decaimento). */
export const BOOST = { kick: 300, keepPerSecond: 0.35 } as const;

/** Rodas motrizes da locomotiva: centros (x), raio e raio da manivela da biela. */
export const DRIVERS = { x: [196, 210], r: 5.2, crank: 2.2 } as const;

/** Fumaça: posição da boca da chaminé (relativa ao trem) e intervalo entre baforadas. */
export const SMOKE = {
  count: 12,
  chimneyX: 219.5,
  chimneyY: RAIL_Y - 34,
  everyMs: 480,
  everyMsBoosted: 120,
} as const;

/** Vagões de passageiros: posição x (relativa ao trem) e as janelas que têm alguém sentado. */
export const COACHES = [
  { x: 0, seated: [1, 2, 4, 6] },
  { x: 66, seated: [0, 3, 5] },
] as const;

/** Janelas de um vagão de 60 de largura: 7 janelas de 4.4, passo 7.6, margem 5 dos dois lados. */
export const WINDOWS = [5, 12.6, 20.2, 27.8, 35.4, 43, 50.6] as const;

/** Engates entre os carros (x do início de cada vão de 6 unidades): vagão-vagão, vagão-tênder, tênder-locomotiva. */
export const COUPLERS = [60, 126, 166] as const;

/** Uma baforada de fumaça: `life` vai de 1 (acabou de sair) a 0 (sumiu). */
export interface Puff {
  life: number;
  x: number;
  y: number;
}

// =====================================================================================
// Pistoleiros
// =====================================================================================

/** Pistoleiros: um pouco à frente dos trilhos e com uma velocidade extra limitada para alcançar o trem. */
export const RIDER = { y: 646, maxCatchUp: 30, maxFallBack: -12 } as const;

/**
 * Elenco: distância-alvo até a traseira do trem (`offset`), se estão armados (`gun`)
 * e a defasagem do galope (`delay`), para os três não galoparem em sincronia.
 */
export const RIDERS = [
  { offset: 22, gun: true, delay: '-.1s' },
  { offset: -42, gun: true, delay: '-1.7s' },
  { offset: -88, gun: false, delay: '-.9s' },
] as const;

/**
 * Desistência: se o trem abrir mais de `gap` de vantagem (Piuí várias vezes seguidas), o pistoleiro
 * freia (`brakeS`), empina o cavalo e atira para o alto (`rearS`), dá meia-volta (`turnS`) e vai embora
 * para a esquerda a `retreatSpeed`. Some a `offscreen` da borda e espera o trem dar a volta para
 * entrar de novo atrás dele, fora da tela.
 */
export const GIVE_UP = {
  gap: 300,
  brakeS: 1.1,
  rearS: 0.95,
  turnS: 0.4,
  retreatSpeed: 64,
  offscreen: 60,
} as const;

/**
 * Tiro perdido: quando o pistoleiro da frente passa pelo "L" de FullStack, um tiro escapa e acerta a letra.
 * Na primeira passagem ela fica pendurada, balançando; na seguinte, outro tiro a conserta, e assim por diante.
 * - `lead`: a que distância (antes do "L", em x) o tiro sai.
 * - `muzzle`: ponta do revólver em relação ao cavaleiro.
 * - `durationS`: tempo da bala até a letra; `tail`: comprimento do rastro (fração do caminho).
 * - `flashMs`: quanto tempo o clarão do disparo fica aceso.
 */
export const STRAY_SHOT = {
  lead: 150,
  muzzle: [24, -27],
  durationS: 0.28,
  tail: 0.3,
  flashMs: 140,
} as const;

// =====================================================================================
// Utilitários
// =====================================================================================

/** Limita `value` ao intervalo [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Desloca uma camada ao contrário do mouse (x, y de -0.5 a 0.5), até `[dx, dy]` px. */
export function shiftLayer(el: Element, x: number, y: number, [dx, dy]: readonly number[]): void {
  (el as HTMLElement | SVGElement).style.transform =
    `translate(${(x * -dx).toFixed(2)}px,${(y * -dy).toFixed(2)}px)`;
}
