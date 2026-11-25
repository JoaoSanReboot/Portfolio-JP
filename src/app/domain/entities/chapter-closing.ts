/** Fechamento de um capítulo: a fogueira, uma frase, um botão e o rodapé. */
export interface ChapterClosing {
  readonly frase: string;
  /** Trecho da `frase` em destaque (ocre). Precisa aparecer igual na frase; vazio = sem destaque. */
  readonly destaque: string;
  readonly botao: { readonly texto: string; readonly link: string };
  readonly rodape: { readonly fim: string; readonly proximo: string };
}
