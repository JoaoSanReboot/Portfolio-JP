/**
 * Um capítulo do site: uma seção, ligada ao menu por âncora.
 * A posição na lista define quantas balas o menu mostra.
 */
export interface Chapter {
  /** Texto do menu. */
  readonly label: string;
  /** Id da seção na página, sem o `#`. */
  readonly anchor: string;
}
