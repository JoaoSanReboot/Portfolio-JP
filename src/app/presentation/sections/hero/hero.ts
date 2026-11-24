import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { PortfolioRepository } from '@domain/repositories/portfolio.repository';
import {
  BOOST,
  COACHES,
  FONT_TIMEOUT_MS,
  MOBILE,
  PARALLAX,
  Puff,
  RAIL_Y,
  RIDER,
  RIDERS,
  SETTLE_MS,
  SMOKE,
  STAGE,
  STRAY_SHOT,
  SUN_TRANSFORM,
  TRAIN,
  WINDOWS,
  buildNameLines,
  clamp,
  splitRole,
} from './hero.scene';

/** O pistoleiro que dispara o tiro perdido: o primeiro armado (o da frente). */
const SHOOTER = RIDERS.findIndex((r) => r.gun);

// =====================================================================================
// Componente
// =====================================================================================

/**
 * Hero "Fronteira": cartaz do Velho Oeste com o nome, o cargo, a foto e um trem de passageiros
 * perseguido por pistoleiros.
 *
 * - O cenário é um "palco" de tamanho fixo escalado por `layout()` (ver CLAUDE.md, seção Layout).
 * - A animação contínua roda num único `requestAnimationFrame` (`tick()`), que escreve direto no DOM.
 *   Isso não passa por signals de propósito: são dezenas de atualizações por segundo que não afetam o template.
 * - Com `prefers-reduced-motion`, a entrada e todo o movimento ficam desligados.
 */
@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  // CSS global com prefixo `fr-`: o palco mistura SVG e HTML e é estilizado como uma peça só.
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  private readonly injector = inject(Injector);

  // ---------- conteúdo (vem do domínio) ----------

  private readonly repository = inject(PortfolioRepository);
  protected readonly profile = this.repository.profile();
  protected readonly chapters = this.repository.chapters();

  // ---------- dados derivados para o template ----------

  /** Munição do menu: o capítulo 1 mostra uma bala, o 2 mostra duas, e assim por diante. */
  protected readonly ammo = this.chapters.map((_, i) => Array.from({ length: i + 1 }, (_, k) => k));
  protected readonly nameLines = buildNameLines(this.profile.name);
  /** Cargo separado em volta do "L" de FullStack (alvo do tiro perdido). */
  protected readonly role = splitRole(this.profile.role);
  protected readonly coaches = COACHES;
  protected readonly windows = WINDOWS;
  protected readonly riders = RIDERS;
  protected readonly puffs = Array.from({ length: SMOKE.count }, (_, i) => i);

  // ---------- estado da interface ----------

  /** Movimento reduzido no sistema: sem entrada animada, sem trem andando, sem paralaxe. */
  protected readonly reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /** Menu em tela cheia do mobile. */
  protected readonly sheetOpen = signal(false);
  /** A foto carregou? Até lá (ou se falhar) aparece o placeholder "Sua foto aqui". */
  protected readonly hasPhoto = signal(false);

  // ---------- elementos que o loop e o layout manipulam ----------

  private readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly sunPos = viewChild.required<ElementRef<SVGGElement>>('sunPos');
  private readonly sun = viewChild.required<ElementRef<SVGGElement>>('sun');
  private readonly far = viewChild.required<ElementRef<SVGGElement>>('far');
  private readonly mid = viewChild.required<ElementRef<SVGGElement>>('mid');
  private readonly cardTilt = viewChild.required<ElementRef<HTMLElement>>('cardTilt');
  private readonly train = viewChild.required<ElementRef<SVGGElement>>('train');
  private readonly toot = viewChild.required<ElementRef<SVGTextElement>>('toot');
  private readonly puffEls = viewChildren<ElementRef<SVGCircleElement>>('puff');
  private readonly riderEls = viewChildren<ElementRef<SVGGElement>>('rider');
  private readonly shotLine = viewChild.required<ElementRef<SVGLineElement>>('shot');
  private readonly roleL = viewChild<ElementRef<HTMLElement>>('roleL');
  private readonly burger = viewChild.required<ElementRef<HTMLButtonElement>>('burger');
  private readonly sheetClose = viewChild.required<ElementRef<HTMLButtonElement>>('sheetClose');

  // ---------- estado do loop (muda a cada frame; fora de signals) ----------

  private lastFrame = performance.now();
  private trainX = -260;
  /** Velocidade extra do Piuí; decai sozinha até zero. */
  private boost = 0;
  private readonly riderX: number[] = RIDERS.map((r) => this.trainX + r.offset);
  private lastPuff = 0;
  private readonly puffState: Puff[] = this.puffs.map(() => ({ life: 0, x: 0, y: 0 }));
  /** Posição do mouse na Hero, de -0.5 a 0.5 em cada eixo. */
  private pointer = { x: 0, y: 0 };
  /** O mesmo valor, suavizado (segue o mouse com atraso). */
  private parallax = { x: 0, y: 0 };
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();

  // ---------- tiro perdido ----------

  /** Centro do "L" em coordenadas do palco (medido em `measureShotTarget()`); null se o cargo não tem "L". */
  private shotTarget: { x: number; y: number } | null = null;
  /** Bala em voo: `t` vai de 0 (saiu do revólver) a 1 (chegou na letra) e segue até o rastro sumir. */
  private shot: { t: number; x0: number; y0: number; x1: number; y1: number; hit: boolean } | null =
    null;
  /** Já atirou nesta passagem do trem? Volta a false quando o trem reentra pela esquerda. */
  private shotThisPass = false;
  /** Estado do "L": pendurado ou no lugar. Alterna a cada acerto. */
  private letterHanging = false;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      // O palco é reescalado sempre que a Hero muda de tamanho.
      const observer = new ResizeObserver(() => this.layout());
      observer.observe(this.hero().nativeElement);
      this.layout();

      // Começa a entrada quando as fontes chegam (ou após o timeout) e então liga o loop.
      let frameId = 0;
      const frame = (now: number) => {
        this.tick(now);
        frameId = requestAnimationFrame(frame);
      };
      const fontsTimeout = new Promise((resolve) => this.later(resolve, FONT_TIMEOUT_MS));
      Promise.race([document.fonts.ready, fontsTimeout]).then(() => {
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
   */
  private layout(): void {
    const hero = this.hero().nativeElement;
    const width = hero.clientWidth;
    const mobile = width < MOBILE.breakpoint;
    let scale: number;
    let tx: number;
    let ty: number;

    hero.setAttribute('data-mode', mobile ? 'm' : 'd');
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
    this.sunPos().nativeElement.setAttribute(
      'transform',
      mobile ? SUN_TRANSFORM.mobile : SUN_TRANSFORM.desktop,
    );
    this.measureShotTarget(); // no mobile o cargo muda de lugar e de tamanho
  }

  /**
   * Mede onde fica o "L" no palco. Usa offsetLeft/offsetTop, que ignoram transformações: o resultado
   * não depende da escala do palco, da entrada animada nem do balanço da própria letra.
   */
  private measureShotTarget(): void {
    const letter = this.roleL()?.nativeElement;
    const role = letter?.offsetParent as HTMLElement | null;
    if (!letter || !role) {
      this.shotTarget = null;
      return;
    }
    this.shotTarget = {
      x: role.offsetLeft + letter.offsetLeft + letter.offsetWidth * 0.35,
      y: role.offsetTop + letter.offsetTop + letter.offsetHeight * 0.55,
    };
  }

  // =====================================================================================
  // Entrada
  // =====================================================================================

  /**
   * Dispara a animação de entrada (classes `is-in` e, ao terminar, `is-settled`).
   * O CSS cuida da animação; aqui só marcamos os momentos.
   */
  private enter(): void {
    const hero = this.hero().nativeElement;
    hero.classList.add('is-in');
    this.measureShotTarget(); // agora com as fontes carregadas
    this.later(() => hero.classList.add('is-settled'), SETTLE_MS);
  }

  // =====================================================================================
  // Loop de animação: trem, pistoleiros, tiro perdido, fumaça e paralaxe
  // =====================================================================================

  private tick(now: number): void {
    // dt limitado: se a aba ficou em segundo plano, nada "teleporta" ao voltar.
    const dt = Math.min(0.05, (now - this.lastFrame) / 1000);
    this.lastFrame = now;

    this.moveTrain(dt);
    this.moveRiders(now / 1000, dt);
    this.moveStrayShot(dt);
    this.moveSmoke(now, dt);
    this.moveParallax(dt);
  }

  /** O trem anda para a direita; ao sair da tela, volta pela esquerda após uma pausa aleatória. */
  private moveTrain(dt: number): void {
    this.trainX += (TRAIN.speed + this.boost) * dt;
    this.boost *= Math.pow(BOOST.keepPerSecond, dt);
    if (this.trainX > TRAIN.exitX) {
      this.trainX = TRAIN.reenterX - Math.random() * TRAIN.reenterJitter;
      // Os pistoleiros reaparecem logo atrás do trem.
      RIDERS.forEach((r, i) => (this.riderX[i] = this.trainX + r.offset - 40));
      this.shotThisPass = false;
    }
    this.train().nativeElement.setAttribute(
      'transform',
      `translate(${this.trainX.toFixed(1)} ${RAIL_Y})`,
    );
  }

  /**
   * Cada pistoleiro cavalga rumo a um ponto que oscila ao lado do trem. A velocidade extra é limitada,
   * então com o Piuí eles ficam para trás e depois alcançam de novo.
   */
  private moveRiders(t: number, dt: number): void {
    const els = this.riderEls();
    RIDERS.forEach((r, i) => {
      const goal = this.trainX + r.offset + Math.sin(t * 0.55 + i * 2.1) * 9;
      const chase = clamp((goal - this.riderX[i]) * 0.9, RIDER.maxFallBack, RIDER.maxCatchUp);
      this.riderX[i] += (TRAIN.speed + chase) * dt;
      els[i].nativeElement.setAttribute(
        'transform',
        `translate(${this.riderX[i].toFixed(1)} ${RIDER.y})`,
      );
    });
  }

  /**
   * Tiro perdido: uma vez por passagem, quando o pistoleiro da frente chega perto do "L", o revólver
   * dispara e o rastro da bala voa até a letra. Ao chegar, a letra alterna entre pendurada e consertada.
   */
  private moveStrayShot(dt: number): void {
    const line = this.shotLine().nativeElement;
    const shot = this.shot;

    if (shot) {
      shot.t += dt / STRAY_SHOT.durationS;
      if (shot.t >= 1 && !shot.hit) {
        shot.hit = true;
        this.hitLetter();
      }
      if (shot.t >= 1 + STRAY_SHOT.tail) {
        this.shot = null;
        line.style.opacity = '0';
        return;
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
      return;
    }

    const target = this.shotTarget;
    if (!target || this.shotThisPass || SHOOTER < 0) return;
    if (!this.hero().nativeElement.classList.contains('is-settled')) return;
    const gunX = this.riderX[SHOOTER] + STRAY_SHOT.muzzle[0];
    if (gunX < target.x - STRAY_SHOT.lead || gunX >= target.x) return;

    // Dispara: clarão no revólver e a bala sai em direção à letra.
    this.shotThisPass = true;
    const rider = this.riderEls()[SHOOTER].nativeElement;
    rider.classList.add('is-firing');
    this.later(() => rider.classList.remove('is-firing'), STRAY_SHOT.flashMs);
    this.shot = {
      t: 0,
      x0: gunX,
      y0: RIDER.y + STRAY_SHOT.muzzle[1],
      x1: target.x,
      y1: target.y,
      hit: false,
    };
  }

  /** A bala chegou: pendura o "L" ou, se ele já estava pendurado, conserta (partindo do ângulo atual). */
  private hitLetter(): void {
    const letter = this.roleL()?.nativeElement;
    if (!letter) return;
    if (this.letterHanging) {
      const angle = getComputedStyle(letter).rotate;
      letter.style.setProperty('--from', angle === 'none' ? '0deg' : angle);
      letter.classList.replace('is-hanging', 'is-fixing');
    } else {
      letter.classList.remove('is-fixing');
      letter.classList.add('is-hanging');
    }
    this.letterHanging = !this.letterHanging;
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

  /**
   * Paralaxe: as camadas se deslocam levemente ao contrário do mouse e o cartão da foto inclina em
   * direção a ele, com o brilho (`--gx`/`--gy`) escorregando junto. Só começa depois da entrada.
   */
  private moveParallax(dt: number): void {
    const ease = Math.min(1, dt * 2.5);
    this.parallax.x += (this.pointer.x - this.parallax.x) * ease;
    this.parallax.y += (this.pointer.y - this.parallax.y) * ease;
    if (!this.hero().nativeElement.classList.contains('is-settled')) return;

    const { x, y } = this.parallax;
    const shift = (el: SVGElement, [dx, dy]: readonly number[]) =>
      (el.style.transform = `translate(${(x * -dx).toFixed(2)}px,${(y * -dy).toFixed(2)}px)`);
    shift(this.far().nativeElement, PARALLAX.far);
    shift(this.mid().nativeElement, PARALLAX.mid);
    shift(this.sun().nativeElement, PARALLAX.sun);

    const card = this.cardTilt().nativeElement;
    const [tiltY, tiltX] = PARALLAX.cardTilt;
    card.style.transform = `rotateY(${(x * tiltY).toFixed(2)}deg) rotateX(${(y * -tiltX).toFixed(2)}deg)`;
    card.style.setProperty('--gx', `${(50 + x * 90).toFixed(1)}%`);
    card.style.setProperty('--gy', `${(30 + y * 70).toFixed(1)}%`);
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

  /** Piuí: clicar no trem (ou Enter/Espaço com ele focado) faz ele acelerar e apitar. */
  protected tootTrain(event?: Event): void {
    event?.preventDefault(); // no teclado, evita a rolagem da página com Espaço
    this.boost = BOOST.kick;

    // Mostra o "PIUÍ!" na hora e, meio segundo depois, deixa ele subir e sumir.
    const toot = this.toot().nativeElement;
    toot.style.transition = 'none';
    toot.style.opacity = '1';
    toot.style.transform = 'none';
    toot.getBBox(); // força o navegador a aplicar o estado acima antes da transição
    this.later(() => {
      toot.style.transition = 'opacity 1.2s, transform 1.2s';
      toot.style.opacity = '0';
      toot.style.transform = 'translateY(-12px)';
    }, 500);
  }

  /** Abre o menu do mobile e leva o foco para o botão de fechar. */
  protected openSheet(): void {
    this.sheetOpen.set(true);
    afterNextRender(() => this.sheetClose().nativeElement.focus(), { injector: this.injector });
  }

  /** Fecha o menu do mobile e devolve o foco ao botão que o abriu. */
  protected closeSheet(): void {
    this.sheetOpen.set(false);
    this.burger().nativeElement.focus();
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
