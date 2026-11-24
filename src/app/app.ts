import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Hero } from '@presentation/sections/hero/hero';

/** Raiz do site: as seções entram aqui, uma abaixo da outra, na ordem do menu. */
@Component({
  selector: 'app-root',
  imports: [Hero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <app-hero />
    </main>
  `,
})
export class App {}
