import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Chapter } from '@domain/entities/chapter';
import { ChapterBullets } from '../chapter-bullets/chapter-bullets';

/**
 * Navegação do site: menu de capítulos no topo (com a munição no lugar dos numerais) e, abaixo de 720px,
 * um botão que abre o menu em tela cheia.
 *
 * Reutilizável em qualquer seção ou página: recebe os capítulos por input e não depende da
 * página principal.
 * Fica posicionada no topo do primeiro ancestral posicionado (absolute), por cima do conteúdo.
 *
 * Uso: `<app-navigation-menu [chapters]="chapters" [current]="'quem-sou'" />`
 */
@Component({
  selector: 'app-navigation-menu',
  imports: [ChapterBullets],
  templateUrl: './navigation-menu.html',
  styleUrl: './navigation-menu.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationMenu {
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

  /** Capítulos do menu, na ordem; a posição define quantas balas cada um mostra. */
  readonly chapters = input.required<readonly Chapter[]>();
  /** Âncora do capítulo atual: fica com o sublinhado fixo. */
  readonly current = input<string | null>(null);

  /** Menu em tela cheia (mobile) aberto? */
  protected readonly sheetOpen = signal(false);

  private readonly burger = viewChild.required<ElementRef<HTMLButtonElement>>('burger');
  private readonly sheetClose = viewChild.required<ElementRef<HTMLButtonElement>>('sheetClose');

  /**
   * Clique num capítulo: o link navega se a seção já existe na página (as outras ainda não foram
   * construídas, por isso o preventDefault). No mobile, fecha o menu.
   */
  protected go(event: Event, chapter: Chapter): void {
    if (!this.document.getElementById(chapter.anchor)) event.preventDefault();
    this.sheetOpen.set(false);
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
}
