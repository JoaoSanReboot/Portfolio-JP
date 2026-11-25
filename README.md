# Portfólio — João Pedro

Feito com **Angular 22** (standalone, signals, zoneless) e CSS puro. Deploy na Vercel.

## Rodando

```bash
npm install
npm start        # http://localhost:4200
npm run build    # saída em dist/portfolio-jp/browser
```

## Estrutura

```
.claude/CLAUDE.md          Guia do projeto: decisões de design, regras e convenções
docs/
  reference/               Referências visuais (main-page.html, about-me.html)
  photos/                  Foto original, antes do recorte
public/                    Arquivos servidos como estão (favicon, profile-photo.jpg)
src/
  index.html, main.ts      Página e ponto de entrada
  tsconfig.json            TypeScript + atalhos de import (@domain, @data, @presentation)
  styles/global.css        Fontes, tokens e base global
  styles/colors-and-fonts.css
                           Cores, fontes e easing (:root)
  styles/chapter-base.css  Base dos capítulos (seções abaixo da página principal)
  app/
    app.ts                 Raiz: empilha as seções
    app.config.ts          Liga os contratos do domínio às implementações
    domain/                Regras do negócio, sem Angular
      entities/            Profile, Chapter, AboutMeContent...
      repositories/        Contrato PortfolioRepository
    data/                  De onde o conteúdo vem
      content/             Textos pessoais (nome, cargo, menu); edite aqui
      repositories/        Implementação estática do contrato
    presentation/          Interface
      shared/              Peças reutilizáveis: navigation-menu, chapter-bullets, paper-texture,
                           rail-divider, block-header, campfire-closing, reveal-on-scroll,
                           loading-screen (tela de carregamento; a marcação dela fica em src/index.html)
      sections/main-page/  Primeira tela: monta a cena e conduz o loop (números em main-page.scene.ts)
        parts/             Uma pasta por peça: sun-and-mountains, train, horse-riders, plateau,
                           photo-card, name-and-role, ground-and-cactus, action-buttons
      sections/about-me/   Capítulo 1, "Sobre mim" (+ parts/, uma pasta por bloco)
                           Textos em data/content/about-me.ts
```

A camada `presentation` nunca importa de `data`: ela pede o conteúdo ao domínio (`PortfolioRepository`), e o
`app.config.ts` decide qual implementação entregar.
