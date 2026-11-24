/** O dono do portfólio. */
export interface Profile {
  readonly name: string;
  /** Cargo, exibido abaixo do nome na Hero. */
  readonly role: string;
  /** Tecnologias principais (para a seção Ferramentas). */
  readonly stack: readonly string[];
  /** Caminho relativo a `public/`, ou `null` para mostrar o placeholder. */
  readonly photoUrl: string | null;
  /** Um resultado real de trabalho (para as próximas seções). */
  readonly highlight: string;
}
