import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { StaticPortfolioRepository } from '@data/repositories/static-portfolio.repository';
import { PortfolioRepository } from '@domain/repositories/portfolio.repository';

/**
 * Configuração da aplicação (zoneless, padrão do Angular 22).
 * É aqui que o contrato do domínio é ligado à implementação: para trocar a fonte do conteúdo
 * (por exemplo, uma API), basta trocar o `useClass`.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: PortfolioRepository, useClass: StaticPortfolioRepository },
  ],
};
