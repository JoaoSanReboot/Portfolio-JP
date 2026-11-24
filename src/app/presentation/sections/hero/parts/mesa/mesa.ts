import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  viewChild,
} from '@angular/core';
import { PARALLAX, shiftLayer } from '../../hero.scene';

/**
 * Mesa: o planalto alaranjado na frente dos trilhos (o trem e os pistoleiros passam por trás dele
 * nos trechos altos). A Hero chama `parallax()` a cada frame.
 */
@Component({
  selector: 'app-hero-mesa',
  templateUrl: './mesa.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroMesa {
  private readonly mid = viewChild.required<ElementRef<SVGGElement>>('mid');

  /** Paralaxe (x, y de -0.5 a 0.5): mais forte que o fundo, por estar mais perto. */
  parallax(x: number, y: number): void {
    shiftLayer(this.mid().nativeElement, x, y, PARALLAX.mid);
  }
}
