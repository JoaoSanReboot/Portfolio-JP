import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Chamadas para ação da página principal, no chão escuro e alinhadas ao nome: "Ver projetos"
 * (botão principal) e "Entrar em contato". As âncoras são de seções futuras, por isso ainda não navegam.
 */
@Component({
  selector: 'app-action-buttons',
  templateUrl: './action-buttons.html',
  styleUrl: './action-buttons.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionButtons {}
