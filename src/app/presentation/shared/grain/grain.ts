import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Granulado de papel impresso: uma textura de ruído por cima de tudo, que dá o ar de cartaz.
 * Cobre o primeiro ancestral posicionado; não recebe cliques.
 *
 * Uso: `<app-grain />` como último filho da seção.
 */
@Component({
  selector: 'app-grain',
  templateUrl: './grain.html',
  styleUrl: './grain.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Grain {}
