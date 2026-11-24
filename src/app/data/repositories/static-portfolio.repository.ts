import { Injectable } from '@angular/core';
import { Chapter } from '@domain/entities/chapter';
import { Profile } from '@domain/entities/profile';
import { PortfolioRepository } from '@domain/repositories/portfolio.repository';
import { CHAPTERS, PROFILE } from '../content/portfolio.content';

/** Implementação estática do repositório: devolve o conteúdo de `content/`. Ligada em app.config.ts. */
@Injectable()
export class StaticPortfolioRepository extends PortfolioRepository {
  profile(): Profile {
    return PROFILE;
  }

  chapters(): readonly Chapter[] {
    return CHAPTERS;
  }
}
