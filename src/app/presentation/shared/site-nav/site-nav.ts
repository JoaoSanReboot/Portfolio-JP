import {
  ChangeDetectionStrategy,
  Component,
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
import { Ammo } from '../ammo/ammo';

/**
 * Navegação do site: menu de capítulos no topo (com a munição no lugar dos numerais) e, abaixo de 720px,
 * um botão que abre o menu em tela cheia.
 *
 * Reutilizável em qualquer seção ou página: recebe os capítulos por input e não depende da Hero.
 * Fica posicionada no topo do primeiro ancestral posicionado (absolute), por cima do conteúdo.
 *
 * Uso: `<app-site-nav [chapters]="chapters" [current]="'quem-sou'" />`
 */
@Component({
  selector: 'app-site-nav',
  imports: [Ammo],
  templateUrl: './site-nav.html',
  styleUrl: './site-nav.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteNav {
  private readonly injector = inject(Injector);

  /** Capítulos do menu, na ordem; a posição define quantas balas cada um mostra. */
  readonly chapters = input.required<readonly Chapter[]>();
  /** Âncora do capítulo atual: fica com o sublinhado fixo. */
  readonly current = input<string | null>(null);

  /** Menu em tela cheia (mobile) aberto? */
  protected readonly sheetOpen = signal(false);

  private readonly burger = viewChild.required<ElementRef<HTMLButtonElement>>('burger');
  private readonly sheetClose = viewChild.required<ElementRef<HTMLButtonElement>>('sheetClose');

  /**
   * Clique num capítulo. As seções ainda não existem, então o link não navega (por isso o
   * preventDefault); no mobile, fecha o menu.
   */
  protected go(event: Event): void {
    event.preventDefault();
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
