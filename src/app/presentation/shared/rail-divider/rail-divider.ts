import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { ChapterBullets } from '../chapter-bullets/chapter-bullets';
import { RevealOnScroll } from '../reveal-on-scroll/reveal-on-scroll';

/**
 * Trilho divisor: abre um capítulo. As balas (capítulo N = N balas, como no menu) e o nome à esquerda,
 * e a linha dupla com dormentes, que se desenha ao entrar na tela.
 *
 * Uso: `<app-rail-divider [chapter]="2" label="Ferramentas" />`
 */
@Component({
  selector: 'app-rail-divider',
  imports: [ChapterBullets],
  templateUrl: './rail-divider.html',
  styleUrl: './rail-divider.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [RevealOnScroll],
  host: { class: 'fr-rail-divider' },
})
export class RailDivider {
  /** Número do capítulo (quantas balas mostrar). */
  readonly chapter = input.required<number>();
  /** Nome do capítulo. */
  readonly label = input.required<string>();
}
