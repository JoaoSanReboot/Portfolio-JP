import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  input,
  viewChild,
} from '@angular/core';

/**
 * Quebra o nome em linhas (uma por palavra) com o índice global de cada letra, usado no atraso da entrada.
 * A última letra do nome (o "O" de Pedro) recebe `hat: true` e ganha o chapéu de cowboy.
 */
export function buildNameLines(name: string) {
  let i = 0;
  const words = name.trim().split(/\s+/);
  const total = words.join('').length;
  return words.map((word) => Array.from(word, (c) => ({ c, i: i++, hat: i === total })));
}

/** Separa o cargo em volta do último "L" (o de FullStack), que é o alvo do tiro perdido. */
export function splitRole(role: string) {
  const i = role.toUpperCase().lastIndexOf('L');
  if (i < 0) return { before: role, letter: '', after: '' };
  return { before: role.slice(0, i), letter: role[i], after: role.slice(i + 1) };
}

/**
 * Título da Hero: o nome em letras de cartaz (com o chapéu no "O" de Pedro) e o cargo logo abaixo.
 * O "L" de FullStack é o alvo do tiro perdido: `shotTarget()` diz onde ele está e `hitLetter()`
 * alterna entre pendurado e consertado.
 */
@Component({
  selector: 'app-hero-title',
  templateUrl: './title.html',
  styleUrl: './title.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroTitle {
  readonly name = input.required<string>();
  readonly role = input.required<string>();

  protected readonly nameLines = computed(() => buildNameLines(this.name()));
  protected readonly roleParts = computed(() => splitRole(this.role()));

  private readonly roleL = viewChild<ElementRef<HTMLElement>>('roleL');
  /** O "L" está pendurado? Alterna a cada acerto. */
  private letterHanging = false;

  /**
   * Centro do "L" em coordenadas do palco, ou null se o cargo não tem "L". Usa offsetLeft/offsetTop,
   * que ignoram transformações: não depende da escala do palco, da entrada nem do balanço da letra.
   */
  shotTarget(): { x: number; y: number } | null {
    const letter = this.roleL()?.nativeElement;
    const role = letter?.offsetParent as HTMLElement | null;
    if (!letter || !role) return null;
    return {
      x: role.offsetLeft + letter.offsetLeft + letter.offsetWidth * 0.35,
      y: role.offsetTop + letter.offsetTop + letter.offsetHeight * 0.55,
    };
  }

  /** A bala chegou: pendura o "L" ou, se ele já estava pendurado, conserta (partindo do ângulo atual). */
  hitLetter(): void {
    const letter = this.roleL()?.nativeElement;
    if (!letter) return;
    if (this.letterHanging) {
      const angle = getComputedStyle(letter).rotate;
      letter.style.setProperty('--from', angle === 'none' ? '0deg' : angle);
      letter.classList.replace('is-hanging', 'is-fixing');
    } else {
      letter.classList.remove('is-fixing');
      letter.classList.add('is-hanging');
    }
    this.letterHanging = !this.letterHanging;
  }
}
