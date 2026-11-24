import { Chapter } from '../entities/chapter';
import { Profile } from '../entities/profile';

/**
 * Contrato de acesso ao conteúdo do portfólio.
 * A apresentação depende só disto, nunca da implementação (que fica em `data/` e é ligada em app.config.ts).
 */
export abstract class PortfolioRepository {
  abstract profile(): Profile;
  abstract chapters(): readonly Chapter[];
}
