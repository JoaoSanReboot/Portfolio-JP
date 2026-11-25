import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  inject,
  viewChild,
  viewChildren,
} from '@angular/core';
import { GIVE_UP, RIDER, RIDERS, STRAY_SHOT, StageView, TRAIN, clamp } from '../../main-page.scene';

/**
 * O que cada pistoleiro está fazendo:
 * - `chase`: persegue o trem (com velocidade extra limitada).
 * - `exit`: o trem saiu da tela; ele segue reto até sair também.
 * - `brake` → `rear` → `turn` → `retreat`: desistiu (o trem abriu vantagem demais): freia, empina o
 *   cavalo atirando para o alto, dá meia-volta e vai embora para a esquerda.
 * - `wait`: fora da tela, esperando o trem dar a volta para entrar de novo atrás dele.
 */
type Mode = 'chase' | 'exit' | 'brake' | 'rear' | 'turn' | 'retreat' | 'wait';

/** Classes de animação (horse-riders.css) ligadas em cada modo. */
const MODE_CLASSES: Record<Mode, readonly string[]> = {
  chase: [],
  exit: [],
  brake: ['is-slowing'],
  rear: ['is-halted', 'is-rearing'],
  turn: ['is-halted', 'is-back'],
  retreat: ['is-back'],
  wait: [],
};
const ALL_CLASSES = ['is-slowing', 'is-halted', 'is-rearing', 'is-back'];

interface RiderState {
  x: number;
  mode: Mode;
  /** Tempo no modo atual (s). */
  clock: number;
  /** Velocidade quando começou a frear (s), para desacelerar até zero. */
  brakeFrom: number;
}

/** O pistoleiro que dispara o tiro perdido: o primeiro armado (o da frente). */
const SHOOTER = RIDERS.findIndex((r) => r.gun);

/**
 * Os três pistoleiros a cavalo que perseguem o trem, e o tiro perdido que acerta o "L" de FullStack.
 *
 * Não tem loop próprio: a página principal chama `step()` a cada frame com a posição do trem.
 * Todo o ciclo é fechado, sem teletransporte na tela: quem sai, sai andando; quem volta, volta de
 * fora da tela.
 */
@Component({
  selector: 'app-horse-riders',
  templateUrl: './horse-riders.html',
  styleUrl: './horse-riders.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HorseRiders {
  protected readonly riders = RIDERS;

  private readonly riderEls = viewChildren<ElementRef<SVGGElement>>('rider');
  private readonly shotLine = viewChild.required<ElementRef<SVGLineElement>>('shot');

  private readonly state: RiderState[] = RIDERS.map((r) => ({
    x: TRAIN.startX + r.offset,
    mode: 'chase',
    clock: 0,
    brakeFrom: 0,
  }));

  // ---------- tiro perdido ----------

  /** Bala em voo: `t` vai de 0 (saiu do revólver) a 1 (chegou na letra) e segue até o rastro sumir. */
  private shot: { t: number; x0: number; y0: number; x1: number; y1: number; hit: boolean } | null =
    null;
  /** Já atirou nesta passagem do trem? Volta a false quando o trem dá a volta. */
  private shotThisPass = false;
  private readonly flashTimers = new Set<ReturnType<typeof setTimeout>>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.flashTimers.forEach(clearTimeout));
  }

  /**
   * O trem saiu pela direita e foi reposicionado à esquerda: quem estava perseguindo segue reto até
   * sair da tela, e o tiro perdido fica liberado para a próxima passagem.
   */
  trainWrapped(): void {
    this.shotThisPass = false;
    this.state.forEach((s, i) => s.mode === 'chase' && this.setMode(i, 'exit'));
  }

  /**
   * Avança um frame.
   * @param t tempo em segundos (para a oscilação de cada cavaleiro em volta do alvo)
   * @param trainX traseira do trem no palco
   * @param view trecho do palco visível na tela
   * @param target centro do "L" de FullStack, ou null se o tiro perdido não deve acontecer agora
   * @returns `true` no frame em que a bala acerta a letra
   */
  step(
    t: number,
    dt: number,
    trainX: number,
    view: StageView,
    target: { x: number; y: number } | null,
  ): boolean {
    const els = this.riderEls();
    RIDERS.forEach((r, i) => {
      this.moveRider(i, r.offset, t, dt, trainX, view);
      els[i].nativeElement.setAttribute(
        'transform',
        `translate(${this.state[i].x.toFixed(1)} ${RIDER.y})`,
      );
    });
    return this.moveStrayShot(dt, target);
  }

  // =====================================================================================
  // Movimento de cada cavaleiro
  // =====================================================================================

  private moveRider(
    i: number,
    offset: number,
    t: number,
    dt: number,
    trainX: number,
    view: StageView,
  ): void {
    const s = this.state[i];
    s.clock += dt;

    switch (s.mode) {
      case 'chase': {
        // Cavalga rumo a um ponto que oscila ao lado do trem.
        const goal = trainX + offset + Math.sin(t * 0.55 + i * 2.1) * 9;
        const gap = goal - s.x;
        if (gap > GIVE_UP.gap) {
          s.brakeFrom = TRAIN.speed + RIDER.maxCatchUp;
          this.setMode(i, 'brake');
          break;
        }
        s.x += (TRAIN.speed + clamp(gap * 0.9, RIDER.maxFallBack, RIDER.maxCatchUp)) * dt;
        break;
      }
      case 'exit':
        s.x += TRAIN.speed * dt;
        if (s.x > view.maxX + GIVE_UP.offscreen) this.setMode(i, 'wait');
        break;
      case 'brake': {
        // Desacelera até parar.
        const k = Math.min(1, s.clock / GIVE_UP.brakeS);
        s.x += s.brakeFrom * (1 - k) * dt;
        if (k >= 1) this.setMode(i, 'rear');
        break;
      }
      case 'rear':
        if (s.clock >= GIVE_UP.rearS) this.setMode(i, 'turn');
        break;
      case 'turn':
        if (s.clock >= GIVE_UP.turnS) this.setMode(i, 'retreat');
        break;
      case 'retreat':
        s.x -= GIVE_UP.retreatSpeed * dt;
        if (s.x < view.minX - GIVE_UP.offscreen) this.setMode(i, 'wait');
        break;
      case 'wait': {
        // Só volta quando o lugar dele atrás do trem ainda está fora da tela (logo depois da volta do
        // trem): assim ele entra galopando junto, sem aparecer do nada.
        const slot = trainX + offset - 40;
        if (slot < view.minX - GIVE_UP.offscreen) {
          s.x = slot;
          this.setMode(i, 'chase');
        }
        break;
      }
    }
  }

  /** Troca o modo e as classes de animação do cavaleiro. */
  private setMode(i: number, mode: Mode): void {
    const s = this.state[i];
    s.mode = mode;
    s.clock = 0;
    const el = this.riderEls()[i].nativeElement;
    el.classList.remove(...ALL_CLASSES);
    el.classList.add(...MODE_CLASSES[mode]);
  }

  // =====================================================================================
  // Tiro perdido
  // =====================================================================================

  /**
   * Uma vez por passagem, quando o pistoleiro da frente (ainda perseguindo) chega perto do "L", o
   * revólver dispara e o rastro da bala voa até a letra. Retorna `true` no frame em que ela chega.
   */
  private moveStrayShot(dt: number, target: { x: number; y: number } | null): boolean {
    const line = this.shotLine().nativeElement;
    const shot = this.shot;

    if (shot) {
      shot.t += dt / STRAY_SHOT.durationS;
      let hitNow = false;
      if (shot.t >= 1 && !shot.hit) {
        shot.hit = true;
        hitNow = true;
      }
      if (shot.t >= 1 + STRAY_SHOT.tail) {
        this.shot = null;
        line.style.opacity = '0';
        return hitNow;
      }
      // O rastro é o trecho do caminho entre a cauda e a cabeça da bala.
      const at = (k: number) => [
        shot.x0 + (shot.x1 - shot.x0) * k,
        shot.y0 + (shot.y1 - shot.y0) * k,
      ];
      const [hx, hy] = at(Math.min(1, shot.t));
      const [tx, ty] = at(Math.max(0, shot.t - STRAY_SHOT.tail));
      line.setAttribute('x1', tx.toFixed(1));
      line.setAttribute('y1', ty.toFixed(1));
      line.setAttribute('x2', hx.toFixed(1));
      line.setAttribute('y2', hy.toFixed(1));
      line.style.opacity = '1';
      return hitNow;
    }

    if (!target || this.shotThisPass || SHOOTER < 0) return false;
    const shooter = this.state[SHOOTER];
    if (shooter.mode !== 'chase') return false;
    const gunX = shooter.x + STRAY_SHOT.muzzle[0];
    if (gunX < target.x - STRAY_SHOT.lead || gunX >= target.x) return false;

    // Dispara: clarão no revólver e a bala sai em direção à letra.
    this.shotThisPass = true;
    const rider = this.riderEls()[SHOOTER].nativeElement;
    rider.classList.add('is-firing');
    const id = setTimeout(() => {
      this.flashTimers.delete(id);
      rider.classList.remove('is-firing');
    }, STRAY_SHOT.flashMs);
    this.flashTimers.add(id);
    this.shot = {
      t: 0,
      x0: gunX,
      y0: RIDER.y + STRAY_SHOT.muzzle[1],
      x1: target.x,
      y1: target.y,
      hit: false,
    };
    return false;
  }
}
