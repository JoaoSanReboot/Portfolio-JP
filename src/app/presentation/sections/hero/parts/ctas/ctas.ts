import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Chamadas para ação da Hero, no chão escuro e alinhadas ao nome: "Ver projetos" (botão principal)
 * e "Entrar em contato". As âncoras são de seções futuras, por isso ainda não navegam.
 */
@Component({
  selector: 'app-hero-ctas',
  templateUrl: './ctas.html',
  styleUrl: './ctas.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroCtas {}
