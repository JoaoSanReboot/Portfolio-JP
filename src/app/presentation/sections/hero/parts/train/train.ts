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
import {
  BOOST,
  COACHES,
  COUPLERS,
  DRIVERS,
  Puff,
  RAIL_Y,
  SMOKE,
  StageView,
  TRAIN,
  WINDOWS,
} from '../../hero.scene';

/**
 * Trilhos e trem de passageiros: dois vagões, tênder e locomotiva, ligados por engates.
 * Clicar no trem (ou Enter/Espaço com ele focado) é o Piuí: ele apita e dispara na frente.
 *
 * Não tem loop próprio: a Hero chama `step()` a cada frame, e o trem anda, gira as rodas, solta
 * fumaça e, ao sair da tela pela direita, dá a volta e reaparece pela esquerda (fora da tela).
 */
@Component({
  selector: 'app-hero-train',
  templateUrl: './train.html',
  styleUrl: './train.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroTrain {
  // ---------- dados para o template ----------

  protected readonly coaches = COACHES;
  protected readonly windows = WINDOWS;
  protected readonly couplers = COUPLERS;
  protected readonly drivers = DRIVERS;
  protected readonly puffs = Array.from({ length: SMOKE.count }, (_, i) => i);

  // ---------- elementos ----------

  private readonly train = viewChild.required<ElementRef<SVGGElement>>('train');
  private readonly toot = viewChild.required<ElementRef<SVGTextElement>>('toot');
  private readonly rod = viewChild.required<ElementRef<SVGLineElement>>('rod');
  private readonly spokes = viewChildren<ElementRef<SVGGElement>>('spokes');
  private readonly puffEls = viewChildren<ElementRef<SVGCircleElement>>('puff');

  // ---------- estado (muda a cada frame; fora de signals) ----------

  /** Posição da traseira do trem no palco. */
  private trainX: number = TRAIN.startX;
  /** Velocidade extra do Piuí; decai sozinha até zero. */
  private boost = 0;
  /** Distância percorrida, para girar as rodas na velocidade certa. */
  private travelled = 0;
  private lastPuff = 0;
  private readonly puffState: Puff[] = this.puffs.map(() => ({ life: 0, x: 0, y: 0 }));
  private tootTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.tootTimer));
  }

  /** Posição atual da traseira do trem (os pistoleiros se guiam por ela). */
  get x(): number {
    return this.trainX;
  }

  /**
   * Avança um frame. Retorna `true` quando o trem acabou de sair pela direita e foi reposicionado
   * à esquerda (a Hero avisa os pistoleiros).
   */
  step(now: number, dt: number, view: StageView): boolean {
    const speed = TRAIN.speed + this.boost;
    this.trainX += speed * dt;
    this.travelled += speed * dt;
    this.boost *= Math.pow(BOOST.keepPerSecond, dt);

    let wrapped = false;
    if (this.trainX > view.maxX + TRAIN.exitMargin) {
      // Volta sempre fora da tela, longe o bastante para os pistoleiros entrarem atrás dele sem aparecer.
      const start = Math.min(TRAIN.reenterX, view.minX - TRAIN.length - 300);
      this.trainX = start - Math.random() * TRAIN.reenterJitter;
      wrapped = true;
    }

    this.train().nativeElement.setAttribute(
      'transform',
      `translate(${this.trainX.toFixed(1)} ${RAIL_Y})`,
    );
    this.turnWheels();
    this.moveSmoke(now, dt);
    return wrapped;
  }

  /** Piuí: o trem apita e ganha um impulso que decai em alguns segundos. */
  protected tootTrain(event?: Event): void {
    event?.preventDefault(); // no teclado, evita a rolagem da página com Espaço
    this.boost = BOOST.kick;

    // Mostra o "PIUÍ!" na hora e, meio segundo depois, deixa ele subir e sumir.
    const toot = this.toot().nativeElement;
    toot.style.transition = 'none';
    toot.style.opacity = '1';
    toot.style.transform = 'none';
    toot.getBBox(); // força o navegador a aplicar o estado acima antes da transição
    clearTimeout(this.tootTimer);
    this.tootTimer = setTimeout(() => {
      toot.style.transition = 'opacity 1.2s, transform 1.2s';
      toot.style.opacity = '0';
      toot.style.transform = 'translateY(-12px)';
    }, 500);
  }

  /**
   * Rodas motrizes: os raios giram conforme a distância andada (sem patinar) e a biela, presa
   * nas manivelas, descreve um círculo junto com elas.
   */
  private turnWheels(): void {
    const angle = this.travelled / DRIVERS.r; // radianos
    const deg = ((angle * 180) / Math.PI) % 360;
    this.spokes().forEach((s, i) =>
      s.nativeElement.setAttribute(
        'transform',
        `rotate(${deg.toFixed(1)} ${DRIVERS.x[i]} ${-DRIVERS.r})`,
      ),
    );
    const dx = Math.cos(angle) * DRIVERS.crank;
    const dy = Math.sin(angle) * DRIVERS.crank;
    this.rod().nativeElement.setAttribute(
      'transform',
      `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`,
    );
  }

  /** Solta baforadas pela chaminé (mais rápido com o Piuí); cada uma sobe, cresce e some. */
  private moveSmoke(now: number, dt: number): void {
    const every = this.boost > 40 ? SMOKE.everyMsBoosted : SMOKE.everyMs;
    if (now - this.lastPuff > every) {
      this.lastPuff = now;
      const free = this.puffState.find((p) => p.life <= 0);
      if (free)
        Object.assign(free, { life: 1, x: this.trainX + SMOKE.chimneyX, y: SMOKE.chimneyY });
    }

    const els = this.puffEls();
    this.puffState.forEach((p, i) => {
      const el = els[i].nativeElement;
      if (p.life <= 0) {
        el.style.opacity = '0';
        return;
      }
      p.life -= dt * 0.5;
      p.x -= dt * (12 + this.boost * 0.3); // o vento leva a fumaça para trás
      p.y -= dt * 14;
      el.setAttribute('cx', p.x.toFixed(1));
      el.setAttribute('cy', p.y.toFixed(1));
      el.setAttribute('r', (3 + (1 - p.life) * 9).toFixed(1));
      el.style.opacity = Math.max(0, p.life * 0.7).toFixed(2);
    });
  }
}
