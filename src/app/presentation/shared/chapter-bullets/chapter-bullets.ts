import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';

/**
 * Munição: N balas de revólver lado a lado. É o "numeral" dos capítulos (capítulo N = N balas).
 * Puramente decorativo (aria-hidden): o texto ao lado já diz o capítulo.
 *
 * Uso: `<app-chapter-bullets [count]="3" />`. A cor da ponta segue `--c-muted`; troque a variável no contexto
 * (ex.: sobre o chão escuro) para mudar o tom.
 */
@Component({
  selector: 'app-chapter-bullets',
  templateUrl: './chapter-bullets.html',
  styleUrl: './chapter-bullets.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'fr-chapter-bullets', 'aria-hidden': 'true' },
})
export class ChapterBullets {
  /** Quantas balas mostrar. */
  readonly count = input.required<number>();

  /** Índices das balas (0..count-1); o índice defasa o pulinho de cada bala no hover. */
  protected readonly bullets = computed(() => Array.from({ length: this.count() }, (_, k) => k));
}
