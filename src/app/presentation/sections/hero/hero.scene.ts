/*
 * Configuração da cena da Hero: números, tamanhos e o elenco do trem.
 * Ajuste aqui velocidade, posições e quantidades sem mexer na lógica do componente (hero.ts).
 * Todas as medidas estão em unidades do palco (1440×900).
 */

/** Palco do desktop: um pôster de 1440×900 unidades, escalado para caber na tela. */
export const STAGE = { width: 1440, height: 900 } as const;

/** Abaixo de 720px, mostra só uma janela de 400 unidades da cena, centrada em x=790. */
export const MOBILE = { breakpoint: 720, window: 400, centerX: 790, height: 880 } as const;

/** O sol muda de lugar e tamanho no mobile para caber atrás do cartão da foto. */
export const SUN_TRANSFORM = {
  desktop: 'translate(1100 470)',
  mobile: 'translate(903 232) scale(.5)',
} as const;

/** Altura dos trilhos no palco. */
export const RAIL_Y = 640;

/** Trem: velocidade de cruzeiro (unidades/s) e o trecho em que ele some e reaparece. */
export const TRAIN = { speed: 38, exitX: 1900, reenterX: -900, reenterJitter: 600 } as const;

/** Piuí: impulso extra de velocidade e quanto dele sobra depois de 1 segundo (decaimento). */
export const BOOST = { kick: 300, keepPerSecond: 0.35 } as const;

/** Fumaça: posição da chaminé (relativa ao trem) e intervalo entre baforadas (normal e acelerado). */
export const SMOKE = {
  count: 12,
  chimneyX: 180,
  chimneyY: 607,
  everyMs: 480,
  everyMsBoosted: 120,
} as const;

/** Pistoleiros: um pouco à frente dos trilhos e com uma velocidade extra limitada para alcançar o trem. */
export const RIDER = { y: 646, maxCatchUp: 30, maxFallBack: -12 } as const;

/** Paralaxe: deslocamento máximo de cada camada (px) e inclinação máxima do cartão da foto (graus). */
export const PARALLAX = { far: [6, 3], mid: [14, 4], sun: [3, 2], cardTilt: [18, 14] } as const;

/** Fim da animação de entrada: só depois disso a paralaxe começa a mexer nas camadas. */
export const SETTLE_MS = 3400;

/** Espera máxima pelas fontes antes de começar a entrada (evita trocar a fonte no meio da animação). */
export const FONT_TIMEOUT_MS = 900;

/** Trem de passageiros: dois vagões (x relativo ao trem) e as janelas que têm alguém sentado. */
export const COACHES = [
  { x: 0, seated: [1, 2, 4, 6] },
  { x: 64, seated: [0, 3, 5] },
] as const;

/** Posição x de cada janela dentro de um vagão. */
export const WINDOWS = [4.6, 12, 19.4, 26.8, 34.2, 41.6, 49] as const;

/**
 * Pistoleiros: distância-alvo até a traseira do trem (`offset`), se estão atirando (`gun`)
 * e a defasagem do galope (`delay`), para os três não galoparem em sincronia.
 */
export const RIDERS = [
  { offset: 22, gun: true, delay: '-.1s' },
  { offset: -42, gun: true, delay: '-1.7s' },
  { offset: -88, gun: false, delay: '-.9s' },
] as const;

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

/** Separa o cargo em volta do último "L" (o de FullStack), que é o alvo do tiro perdido. */
export function splitRole(role: string) {
  const i = role.toUpperCase().lastIndexOf('L');
  if (i < 0) return { before: role, letter: '', after: '' };
  return { before: role.slice(0, i), letter: role[i], after: role.slice(i + 1) };
}

/**
 * Quebra o nome em linhas (uma por palavra) com o índice global de cada letra, usado no atraso da entrada.
 * A última letra do nome (o "O" de Pedro) recebe `hat: true` e ganha o chapéu de cowboy.
 */
export function buildNameLines(name: string) {
  let i = 0;
  const words = name.trim().split(/\s+/);
  const total = words.join('').length;
  return words.map((word) => Array.from(word, (c) => ({ c, i: i++, hat: i === total })));
}

/** Uma baforada de fumaça: `life` vai de 1 (acabou de sair) a 0 (sumiu). */
export interface Puff {
  life: number;
  x: number;
  y: number;
}

/** Limita `value` ao intervalo [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
