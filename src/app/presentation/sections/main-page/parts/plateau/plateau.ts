import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  viewChild,
} from '@angular/core';
import { PARALLAX, shiftLayer } from '../../main-page.scene';

/**
 * Planalto alaranjado, na frente dos trilhos (o trem e os pistoleiros passam por trás dele
 * nos trechos altos). A página principal chama `parallax()` a cada frame.
 */
@Component({
  selector: 'app-plateau',
  templateUrl: './plateau.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Plateau {
  private readonly mid = viewChild.required<ElementRef<SVGGElement>>('mid');

  /** Paralaxe (x, y de -0.5 a 0.5): mais forte que o fundo, por estar mais perto. */
  parallax(x: number, y: number): void {
    shiftLayer(this.mid().nativeElement, x, y, PARALLAX.mid);
  }
}
