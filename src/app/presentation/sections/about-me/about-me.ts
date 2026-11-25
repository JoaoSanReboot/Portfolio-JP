import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { PortfolioRepository } from '@domain/repositories/portfolio.repository';
import { PaperTexture } from '@presentation/shared/paper-texture/paper-texture';
import { RailDivider } from '@presentation/shared/rail-divider/rail-divider';
import { RevealOnScroll } from '@presentation/shared/reveal-on-scroll/reveal-on-scroll';
import { CampfireScene } from './parts/campfire-scene/campfire-scene';

/**
 * Capítulo 1, "Sobre mim": o lado pessoal, contado com vocabulário do Velho Oeste.
 * Referência visual: docs/reference/about-me.html.
 *
 * A seção só monta as peças (em `parts/` e em `presentation/shared/`) e conduz o único loop, o da
 * chaleira, que roda apenas enquanto a abertura está na tela. Todo o texto vem do domínio
 * (data/content/about-me.ts).
 */
@Component({
  selector: 'app-about-me',
  imports: [PaperTexture, RailDivider, RevealOnScroll, CampfireScene],
  templateUrl: './about-me.html',
  styleUrl: './about-me.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutMe {
  protected readonly content = inject(PortfolioRepository).aboutMe();
  /** Título quebrado em linhas, uma por palavra. */
  protected readonly titleLines = this.content.titulo.split(' ');
  /** Movimento reduzido no sistema: sem loop. */
  protected readonly reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly opening = viewChild.required<ElementRef<HTMLElement>>('opening');
  private readonly campfire = viewChild.required(CampfireScene);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (this.reducedMotion) return;

      let frameId = 0;
      let last = 0;
      const frame = (now: number) => {
        // dt limitado: depois de uma pausa, a cena retoma de onde parou.
        this.campfire().step(Math.min(0.05, Math.max(0, now - last) / 1000));
        last = now;
        frameId = requestAnimationFrame(frame);
      };
      const observer = new IntersectionObserver((entries) => {
        cancelAnimationFrame(frameId);
        if (!entries[entries.length - 1].isIntersecting) return;
        last = performance.now();
        frameId = requestAnimationFrame(frame);
      });
      observer.observe(this.opening().nativeElement);

      destroyRef.onDestroy(() => {
        observer.disconnect();
        cancelAnimationFrame(frameId);
      });
    });
  }
}
