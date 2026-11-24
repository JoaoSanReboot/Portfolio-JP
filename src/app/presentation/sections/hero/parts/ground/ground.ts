import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/** Primeiro plano da Hero: o cacto (só cenário) e o chão escuro onde ficam as chamadas. */
@Component({
  selector: 'app-hero-ground',
  templateUrl: './ground.html',
  styleUrl: './ground.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroGround {}
