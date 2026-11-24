import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { PARALLAX } from '../../hero.scene';

/**
 * Cartão da foto: cantos arredondados, sombra suave e a foto em sépia, na frente do sol.
 * Não flutua: só inclina em 3D seguindo o mouse (`tilt()`, chamado pela Hero a cada frame), com um
 * brilho que acompanha a inclinação. Sem foto (ou enquanto ela carrega), mostra o placeholder.
 */
@Component({
  selector: 'app-hero-portrait',
  templateUrl: './portrait.html',
  styleUrl: './portrait.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroPortrait {
  /** Nome da pessoa (para o texto alternativo). */
  readonly name = input.required<string>();
  /** Caminho da foto (relativo a `public/`), ou null para o placeholder. */
  readonly photoUrl = input<string | null>(null);

  /** A foto carregou? Até lá (ou se falhar) aparece o placeholder "Sua foto aqui". */
  protected readonly hasPhoto = signal(false);

  private readonly tiltEl = viewChild.required<ElementRef<HTMLElement>>('tilt');

  /** Inclina o cartão em direção ao mouse (x, y de -0.5 a 0.5) e escorrega o brilho junto. */
  tilt(x: number, y: number): void {
    const card = this.tiltEl().nativeElement;
    const [maxY, maxX] = PARALLAX.cardTilt;
    card.style.transform = `rotateY(${(x * maxY).toFixed(2)}deg) rotateX(${(y * -maxX).toFixed(2)}deg)`;
    card.style.setProperty('--gx', `${(50 + x * 90).toFixed(1)}%`);
    card.style.setProperty('--gy', `${(30 + y * 70).toFixed(1)}%`);
  }
}
