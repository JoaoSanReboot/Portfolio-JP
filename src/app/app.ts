import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MainPage } from '@presentation/sections/main-page/main-page';
import { AboutMe } from '@presentation/sections/about-me/about-me';

/** Raiz do site: as seções entram aqui, uma abaixo da outra, na ordem do menu. */
@Component({
  selector: 'app-root',
  imports: [MainPage, AboutMe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <app-main-page />
      <app-about-me />
    </main>
  `,
})
export class App {}
