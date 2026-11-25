import { DestroyRef, Directive, ElementRef, afterNextRender, inject, signal } from '@angular/core';

/**
 * Liga a classe `is-seen` no elemento quando ele entra na tela (uma vez só).
 * Com a classe `fr-reveal` (styles/chapter-base.css), o elemento aparece num fade; sem ela, cada peça decide
 * o que animar. Com movimento reduzido, já nasce visto.
 *
 * Uso: `<li class="fr-reveal" appRevealOnScroll>` ou, num componente, `hostDirectives: [RevealOnScroll]`.
 */
@Directive({ selector: '[appRevealOnScroll]', host: { '[class.is-seen]': 'seen()' } })
export class RevealOnScroll {
  protected readonly seen = signal(false);

  constructor() {
    const element: Element = inject(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.seen.set(true);
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          this.seen.set(true);
          observer.disconnect();
        },
        { threshold: 0.15 },
      );
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
