import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { RevealOnScroll } from '../reveal-on-scroll/reveal-on-scroll';

/**
 * Cabeçalho de um bloco do capítulo: letra em itálico, título (h3) e um rótulo à direita, sobre um fio.
 *
 * Uso: `<app-block-header letter="a." heading="Título" kicker="Rótulo" />`
 */
@Component({
  selector: 'app-block-header',
  templateUrl: './block-header.html',
  styleUrl: './block-header.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [RevealOnScroll],
  host: { class: 'fr-block-header fr-reveal' },
})
export class BlockHeader {
  readonly letter = input.required<string>();
  readonly heading = input.required<string>();
  readonly kicker = input.required<string>();
}
