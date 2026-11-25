import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  input,
  viewChild,
  viewChildren,
} from '@angular/core';
import { AboutMeContent } from '@domain/entities/about-me';
import { GLASS, KETTLE, POUR, Point, pourOffset, spoutAt } from './campfire-scene.scene';

/**
 * O que a chaleira está fazendo:
 * - `hung`: no gancho (ou voltando para ele).
 * - `held`: na mão de quem arrasta.
 * - `serving`: servindo sozinha um copo (clique ou teclado).
 */
type Mode = 'hung' | 'held' | 'serving';

/**
 * Noite de fogueira: um círculo de céu noturno apoiado no chão, com o fogo aceso, a chaleira no tripé,
 * dois copos no toco e um tronco para sentar. Embaixo, a legenda.
 *
 * Easter egg: arrastar a chaleira até um copo serve o café (ela inclina e o copo enche). Clicar, ou
 * Enter/Espaço com ela focada, serve o próximo copo vazio.
 *
 * O fogo é CSS. A chaleira não tem loop próprio: a seção chama `step()` a cada frame. Com movimento
 * reduzido não há loop, e servir enche o copo na hora.
 *
 * Uso: `<app-campfire-scene [content]="content.ilustracao" [reducedMotion]="reducedMotion" />`
 */
@Component({
  selector: 'app-campfire-scene',
  templateUrl: './campfire-scene.html',
  styleUrl: './campfire-scene.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'fr-about-campfire' },
})
export class CampfireScene {
  readonly content = input.required<AboutMeContent['ilustracao']>();
  readonly reducedMotion = input(false);

  // ---------- dados e elementos ----------

  protected readonly glasses = GLASS.xs;
  protected readonly glassBaseY = GLASS.baseY;

  private readonly svg = viewChild.required<ElementRef<SVGSVGElement>>('svg');
  private readonly kettle = viewChild.required<ElementRef<SVGGElement>>('kettle');
  private readonly stream = viewChild.required<ElementRef<SVGPathElement>>('stream');
  private readonly glassEls = viewChildren<ElementRef<SVGGElement>>('glass');
  private readonly coffeeEls = viewChildren<ElementRef<SVGRectElement>>('coffee');

  // ---------- estado (muda a cada frame; fora de signals) ----------

  private mode: Mode = 'hung';
  /** Posição da chaleira, em relação ao gancho. */
  private position: Point = { x: 0, y: 0 };
  private tilt = 0;
  private tiltSpeed = 0;
  /** Onde a mão quer a chaleira. */
  private hand: Point = { x: 0, y: 0 };
  /** Ponto em que o ponteiro pegou a chaleira, e se ele já andou o bastante para ser um arrasto. */
  private grab: Point = { x: 0, y: 0 };
  private pressedAt: Point = { x: 0, y: 0 };
  private dragged = false;
  /** Copo que está sendo servido sozinho. */
  private servingGlass = 0;
  /** Café em cada copo, de 0 a 1. */
  private readonly levels: number[] = GLASS.xs.map(() => 0);

  // =====================================================================================
  // Loop (chamado pela seção)
  // =====================================================================================

  /** Avança um frame: move e inclina a chaleira e, se ela estiver servindo, enche o copo. */
  step(dt: number): void {
    if (this.isResting()) return;

    const glass = this.glassUnderSpout();
    const goal = glass >= 0 ? pourOffset(glass) : this.mode === 'held' ? this.hand : { x: 0, y: 0 };
    const ease = Math.min(1, dt * (this.mode === 'held' ? KETTLE.holdEase : KETTLE.travelEase));
    this.position.x += (goal.x - this.position.x) * ease;
    this.position.y += (goal.y - this.position.y) * ease;

    // A inclinação é uma mola: balança um pouco ao parar, como algo pendurado.
    const distance = Math.hypot(goal.x - this.position.x, goal.y - this.position.y);
    const tiltGoal = glass >= 0 && distance < POUR.near ? POUR.tilt : 0;
    this.tiltSpeed +=
      (KETTLE.spring * (tiltGoal - this.tilt) - KETTLE.damping * this.tiltSpeed) * dt;
    this.tilt += this.tiltSpeed * dt;

    this.drawKettle();
    this.pour(glass, dt);
  }

  /** Parada no gancho: nada a atualizar. */
  private isResting(): boolean {
    const { x, y } = this.position;
    const moving = Math.max(
      Math.abs(x),
      Math.abs(y),
      Math.abs(this.tilt),
      Math.abs(this.tiltSpeed),
    );
    return this.mode === 'hung' && moving < 0.01;
  }

  /** O copo a servir agora (o índice), ou -1: o escolhido ou, na mão, o que estiver perto do bico. */
  private glassUnderSpout(): number {
    if (this.mode === 'serving') return this.servingGlass;
    if (this.mode === 'hung') return -1;
    return this.levels.findIndex((level, i) => {
      const spot = pourOffset(i);
      return (
        level < 1 &&
        Math.abs(this.hand.x - spot.x) < POUR.reachX &&
        Math.abs(this.hand.y - spot.y) < POUR.reachY
      );
    });
  }

  /** Enche o copo enquanto a chaleira está inclinada sobre ele e desenha o fio de café. */
  private pour(glass: number, dt: number): void {
    const stream = this.stream().nativeElement;
    if (glass < 0 || this.tilt > POUR.streamFrom) {
      stream.style.opacity = '0';
      return;
    }

    this.setLevel(glass, this.levels[glass] + dt / POUR.fillS);
    if (this.levels[glass] >= 1 && this.mode === 'serving') this.mode = 'hung';

    const tip = spoutAt(this.tilt);
    const x = KETTLE.pivot.x + this.position.x + tip.x;
    const y = KETTLE.pivot.y + this.position.y + tip.y;
    const glassX = GLASS.xs[glass];
    const surface = GLASS.baseY - GLASS.bottom - this.levels[glass] * GLASS.depth;
    stream.setAttribute(
      'd',
      `M${x.toFixed(1)} ${y.toFixed(1)} Q${glassX} ${y.toFixed(1)} ${glassX} ${surface.toFixed(1)}`,
    );
    stream.style.opacity = '1';
  }

  private drawKettle(): void {
    const { x, y } = this.position;
    const { pivot } = KETTLE;
    this.kettle().nativeElement.setAttribute(
      'transform',
      `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${this.tilt.toFixed(2)} ${pivot.x} ${pivot.y})`,
    );
  }

  private setLevel(glass: number, level: number): void {
    const full = Math.min(1, level);
    this.levels[glass] = full;
    const height = full * GLASS.depth;
    const coffee = this.coffeeEls()[glass].nativeElement;
    coffee.setAttribute('y', (-GLASS.bottom - height).toFixed(2));
    coffee.setAttribute('height', height.toFixed(2));
    // Copo cheio: solta vapor
    this.glassEls()[glass].nativeElement.classList.toggle('is-full', full >= 1);
  }

  // =====================================================================================
  // Interações
  // =====================================================================================

  /** Pega a chaleira. */
  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    const point = this.toScene(event);
    this.kettle().nativeElement.setPointerCapture(event.pointerId);
    this.mode = 'held';
    this.dragged = false;
    this.pressedAt = point;
    this.grab = { x: point.x - this.position.x, y: point.y - this.position.y };
    this.hand = { ...this.position };
  }

  /** Leva a chaleira, sem sair dos limites da cena. */
  protected onPointerMove(event: PointerEvent): void {
    if (this.mode !== 'held') return;
    const point = this.toScene(event);
    const moved = Math.hypot(point.x - this.pressedAt.x, point.y - this.pressedAt.y);
    if (moved > KETTLE.clickSlop) this.dragged = true;

    const { minX, maxX, minY, maxY } = KETTLE.bounds;
    this.hand = {
      x: Math.max(minX, Math.min(maxX, point.x - this.grab.x)),
      y: Math.max(minY, Math.min(maxY, point.y - this.grab.y)),
    };
  }

  /** Solta: volta para o gancho ou, se foi só um clique, serve sozinha. */
  protected onPointerUp(): void {
    if (this.mode !== 'held') return;
    this.mode = 'hung';
    if (!this.dragged) this.serve();
  }

  /** Arrasto interrompido pelo sistema: volta para o gancho. */
  protected onPointerCancel(): void {
    if (this.mode === 'held') this.mode = 'hung';
  }

  /** Enter/Espaço ou o clique de um leitor de tela (o do mouse, com `detail` > 0, já passou por onPointerUp). */
  protected onActivate(event: Event): void {
    if (event instanceof MouseEvent && event.detail > 0) return;
    event.preventDefault(); // no teclado, evita a rolagem da página com Espaço
    this.serve();
  }

  /** Serve o próximo copo que não está cheio; com os dois cheios, a chaleira só balança no gancho. */
  private serve(): void {
    if (this.mode !== 'hung') return;
    const next = this.levels.findIndex((level) => level < 1);
    if (next < 0) {
      this.tiltSpeed += KETTLE.nudge;
    } else if (this.reducedMotion()) {
      this.setLevel(next, 1);
    } else {
      this.servingGlass = next;
      this.mode = 'serving';
    }
  }

  /** Posição do ponteiro em unidades do desenho. */
  private toScene(event: PointerEvent): Point {
    const matrix = this.svg().nativeElement.getScreenCTM();
    const point = new DOMPoint(event.clientX, event.clientY);
    return matrix ? point.matrixTransform(matrix.inverse()) : point;
  }
}
