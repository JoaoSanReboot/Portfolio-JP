import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/** Primeiro plano da página principal: o cacto (só cenário) e o chão escuro onde ficam as chamadas. */
@Component({
  selector: 'app-ground-and-cactus',
  templateUrl: './ground-and-cactus.html',
  styleUrl: './ground-and-cactus.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroundAndCactus {}
