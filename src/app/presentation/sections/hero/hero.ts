import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { PortfolioRepository } from '@domain/repositories/portfolio.repository';
import { BootScreen } from '@presentation/shared/boot-screen/boot-screen';
import { Grain } from '@presentation/shared/grain/grain';
import { SiteNav } from '@presentation/shared/site-nav/site-nav';
import { FONT_TIMEOUT_MS, MOBILE, SETTLE_MS, STAGE, StageView } from './hero.scene';
import { HeroBackdrop } from './parts/backdrop/backdrop';
import { HeroCtas } from './parts/ctas/ctas';
import { HeroGround } from './parts/ground/ground';
import { HeroMesa } from './parts/mesa/mesa';
import { HeroPortrait } from './parts/portrait/portrait';
import { HeroRiders } from './parts/riders/riders';
import { HeroTitle } from './parts/title/title';
import { HeroTrain } from './parts/train/train';

/**
 * Hero "Fronteira": cartaz do Velho Oeste com o nome, o cargo, a foto e um trem de passageiros
 * perseguido por pistoleiros.
 *
 * Esta classe só monta e conduz a cena; cada peça vive em `parts/` (e a navegação e o granulado em
 * `presentation/shared/`, para reuso):
 * - `layout()` escala o palco para a tela (ver CLAUDE.md, seção Layout) e calcula o trecho visível.
 * - `enter()` dispara a entrada (o CSS faz a coreografia).
 * - `tick()` é o único `requestAnimationFrame`: a cada frame manda o trem, os pistoleiros e a paralaxe
 *   darem um passo. Isso não passa por signals de propósito: são dezenas de atualizações por segundo
 *   escritas direto no DOM, que não afetam o template.
 * - Com `prefers-reduced-motion`, a entrada e todo o movimento ficam desligados.
 */
@Component({
  selector: 'app-hero',
  imports: [
    SiteNav,
    Grain,
    HeroBackdrop,
    HeroTrain,
    HeroRiders,
    HeroMesa,
    HeroPortrait,
    HeroTitle,
    HeroGround,
    HeroCtas,
  ],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  // CSS global com prefixo `fr-`: o palco mistura SVG e HTML e é estilizado como uma peça só.
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  // ---------- conteúdo (vem do domínio) ----------

  private readonly repository = inject(PortfolioRepository);
  private readonly bootScreen = inject(BootScreen);
  protected readonly profile = this.repository.profile();
  protected readonly chapters = this.repository.chapters();

  // ---------- estado da interface ----------

  /** Movimento reduzido no sistema: sem entrada animada, sem trem andando, sem paralaxe. */
  protected readonly reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /** Tela estreita (< 720px): a cena vira a janela de 400 unidades. */
  protected readonly mobile = signal(false);

  // ---------- elementos e peças ----------

  private readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly backdrop = viewChild.required(HeroBackdrop);
  private readonly train = viewChild.required(HeroTrain);
  private readonly riders = viewChild.required(HeroRiders);
  private readonly mesa = viewChild.required(HeroMesa);
  private readonly portrait = viewChild.required(HeroPortrait);
  private readonly title = viewChild.required(HeroTitle);

  // ---------- estado do loop (muda a cada frame; fora de signals) ----------

  private lastFrame = performance.now();
  /** Trecho do palco (em x) que aparece na tela; o trem e os pistoleiros somem e voltam fora dele. */
  private view: StageView = { minX: 0, maxX: STAGE.width };
  /** A entrada terminou? Só então começam a paralaxe e o tiro perdido. */
  private settled = false;
  /** Centro do "L" de FullStack no palco (alvo do tiro perdido); medido no layout e na entrada. */
  private shotTarget: { x: number; y: number } | null = null;
  /** Posição do mouse na Hero, de -0.5 a 0.5 em cada eixo. */
  private pointer = { x: 0, y: 0 };
  /** O mesmo valor, suavizado (segue o mouse com atraso). */
  private parallax = { x: 0, y: 0 };
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      // O palco é reescalado sempre que a Hero muda de tamanho.
      const observer = new ResizeObserver(() => this.layout());
      observer.observe(this.hero().nativeElement);
      this.layout();

      // Quando as fontes chegam (ou após o timeout), a tela de carregamento sai; a entrada começa
      // junto com a cortina subindo, e então o loop liga.
      let frameId = 0;
      const frame = (now: number) => {
        this.tick(now);
        frameId = requestAnimationFrame(frame);
      };
      const fontsTimeout = new Promise((resolve) => this.later(resolve, FONT_TIMEOUT_MS));
      Promise.race([document.fonts.ready, fontsTimeout])
        .then(() => this.bootScreen.dismiss())
        .then(() => {
          if (destroyRef.destroyed) return;
          this.enter();
          if (!this.reducedMotion) frameId = requestAnimationFrame(frame);
        });

      destroyRef.onDestroy(() => {
        observer.disconnect();
        cancelAnimationFrame(frameId);
        this.timers.forEach(clearTimeout);
      });
    });
  }

  // =====================================================================================
  // Layout
  // =====================================================================================

  /**
   * Escala o palco para a tela.
   * - Desktop: encaixa 1440×900 inteiro, centralizado e alinhado embaixo (o chão sempre aparece).
   * - Mobile: a largura da tela mostra 400 unidades; a altura da Hero acompanha a escala.
   * Também guarda o trecho visível do palco (`view`) e remede o alvo do tiro perdido.
   */
  private layout(): void {
    const hero = this.hero().nativeElement;
    const width = hero.clientWidth;
    const mobile = width < MOBILE.breakpoint;
    let scale: number;
    let tx: number;
    let ty: number;

    hero.setAttribute('data-mode', mobile ? 'm' : 'd');
    this.mobile.set(mobile);
    if (mobile) {
      scale = width / MOBILE.window;
      tx = width / 2 - MOBILE.centerX * scale;
      ty = 0;
      hero.style.height = `${Math.round(MOBILE.height * scale)}px`;
      hero.style.minHeight = '0';
    } else {
      hero.style.height = '';
      hero.style.minHeight = '';
      const height = hero.clientHeight;
      scale = Math.min(width / STAGE.width, height / STAGE.height);
      tx = width / 2 - (STAGE.width / 2) * scale;
      ty = height - STAGE.height * scale;
    }
    this.stage().nativeElement.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`;
    this.view = { minX: -tx / scale, maxX: (width - tx) / scale };
    this.shotTarget = this.title().shotTarget(); // no mobile o cargo muda de lugar e de tamanho
  }

  // =====================================================================================
  // Entrada
  // =====================================================================================

  /**
   * Dispara a animação de entrada (classes `is-in` e, ao terminar, `is-settled`).
   * O CSS cuida da coreografia; aqui só marcamos os momentos.
   */
  private enter(): void {
    const hero = this.hero().nativeElement;
    hero.classList.add('is-in');
    this.shotTarget = this.title().shotTarget(); // agora com as fontes carregadas
    this.later(() => {
      hero.classList.add('is-settled');
      this.settled = true;
    }, SETTLE_MS);
  }

  // =====================================================================================
  // Loop de animação
  // =====================================================================================

  private tick(now: number): void {
    // dt limitado: se a aba ficou em segundo plano, nada "teleporta" ao voltar.
    const dt = Math.min(0.05, (now - this.lastFrame) / 1000);
    this.lastFrame = now;

    const train = this.train();
    if (train.step(now, dt, this.view)) this.riders().trainWrapped();

    const target = this.settled ? this.shotTarget : null;
    if (this.riders().step(now / 1000, dt, train.x, this.view, target)) this.title().hitLetter();

    this.moveParallax(dt);
  }

  /**
   * Paralaxe: as camadas se deslocam levemente ao contrário do mouse e o cartão da foto inclina em
   * direção a ele. Só começa depois da entrada.
   */
  private moveParallax(dt: number): void {
    const ease = Math.min(1, dt * 2.5);
    this.parallax.x += (this.pointer.x - this.parallax.x) * ease;
    this.parallax.y += (this.pointer.y - this.parallax.y) * ease;
    if (!this.settled) return;

    const { x, y } = this.parallax;
    this.backdrop().parallax(x, y);
    this.mesa().parallax(x, y);
    this.portrait().tilt(x, y);
  }

  // =====================================================================================
  // Interações
  // =====================================================================================

  /** Guarda a posição do mouse; o loop a suaviza e aplica na paralaxe. */
  protected onPointerMove(event: PointerEvent): void {
    const rect = this.hero().nativeElement.getBoundingClientRect();
    this.pointer = {
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5,
    };
  }

  // =====================================================================================
  // Utilitários
  // =====================================================================================

  /** `setTimeout` que é cancelado automaticamente quando o componente é destruído. */
  private later(fn: (value?: unknown) => void, ms: number): void {
    const id = setTimeout(() => {
      this.timers.delete(id);
      fn();
    }, ms);
    this.timers.add(id);
  }
}
