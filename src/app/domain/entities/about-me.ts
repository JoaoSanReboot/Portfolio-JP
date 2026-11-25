/** Todo o conteúdo do capítulo "Sobre mim". */
export interface AboutMeContent {
  /** Nome do capítulo no trilho do topo. */
  readonly trilho: string;
  readonly titulo: string;
  readonly paragrafos: readonly string[];
  readonly ilustracao: {
    /** Texto alternativo, para leitores de tela. */
    readonly descricao: string;
    readonly legenda: string;
  };
}
