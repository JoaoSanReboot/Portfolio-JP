import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/** Cada granulado na página precisa do seu próprio id de filtro. */
let nextId = 0;

/**
 * Granulado de papel impresso: uma textura de ruído por cima de tudo, que dá o ar de cartaz.
 * Cobre o primeiro ancestral posicionado; não recebe cliques.
 *
 * Uso: `<app-paper-texture />` como último filho da seção.
 */
@Component({
  selector: 'app-paper-texture',
  templateUrl: './paper-texture.html',
  styleUrl: './paper-texture.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaperTexture {
  protected readonly filterId = `fr-noise-${nextId++}`;
}
