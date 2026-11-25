import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  input,
  viewChild,
} from '@angular/core';
import { PARALLAX, SUN_TRANSFORM, shiftLayer } from '../../main-page.scene';

/**
 * Fundo da página principal: o sol listrado e as montanhas cor de areia. É a camada mais
 * distante do palco. A página principal chama `parallax()` a cada frame para deslocá-los levemente.
 */
@Component({
  selector: 'app-sun-and-mountains',
  templateUrl: './sun-and-mountains.html',
  styleUrl: './sun-and-mountains.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SunAndMountains {
  /** Modo mobile: o sol fica menor, atrás do cartão da foto. */
  readonly mobile = input(false);

  protected readonly sunTransform = computed(() =>
    this.mobile() ? SUN_TRANSFORM.mobile : SUN_TRANSFORM.desktop,
  );

  private readonly sun = viewChild.required<ElementRef<SVGGElement>>('sun');
  private readonly far = viewChild.required<ElementRef<SVGGElement>>('far');

  /** Paralaxe (x, y de -0.5 a 0.5): as camadas andam um pouco ao contrário do mouse. */
  parallax(x: number, y: number): void {
    shiftLayer(this.sun().nativeElement, x, y, PARALLAX.sun);
    shiftLayer(this.far().nativeElement, x, y, PARALLAX.far);
  }
}
