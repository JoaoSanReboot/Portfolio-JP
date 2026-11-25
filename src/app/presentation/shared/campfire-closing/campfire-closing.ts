import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { ChapterClosing } from '@domain/entities/chapter-closing';
import { RevealOnScroll } from '../reveal-on-scroll/reveal-on-scroll';

/**
 * Fechamento de capítulo: o chão escuro em largura total, com uma cordilheira de mesas na borda de
 * cima e uma fogueira acesa (chamas, faíscas e o bule soltando vapor). Deve ser o último filho de um
 * `.fr-chapter`, porque cobre o respiro do fim (`--pad` e `--pad-end`).
 *
 * Uso: `<app-campfire-closing [closing]="content.fechamento" />`
 */
@Component({
  selector: 'app-campfire-closing',
  imports: [RevealOnScroll],
  templateUrl: './campfire-closing.html',
  styleUrl: './campfire-closing.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'fr-campfire' },
})
export class CampfireClosing {
  readonly closing = input.required<ChapterClosing>();

  /** A frase partida em volta do trecho em destaque. */
  protected readonly phrase = computed(() => {
    const { frase, destaque } = this.closing();
    const at = destaque ? frase.indexOf(destaque) : -1;
    if (at < 0) return { before: frase, highlight: '', after: '' };
    return {
      before: frase.slice(0, at),
      highlight: destaque,
      after: frase.slice(at + destaque.length),
    };
  });
}
