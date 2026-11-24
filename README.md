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
  reference/               Referência visual aprovada da Hero (HTML solto)
  photos/                  Foto original, antes do recorte
public/                    Arquivos servidos como estão (favicon, foto.jpg)
src/
  index.html, main.ts      Página e ponto de entrada
  tsconfig.json            TypeScript + atalhos de import (@domain, @data, @presentation)
  styles/global.css        Fontes, tokens e base global
  styles/tokens.css        Cores, fontes e easing (:root)
  app/
    app.ts                 Raiz: empilha as seções
    app.config.ts          Liga os contratos do domínio às implementações
    domain/                Regras do negócio, sem Angular
      entities/            Profile, Chapter
      repositories/        Contrato PortfolioRepository
    data/                  De onde o conteúdo vem
      content/             Textos pessoais (nome, cargo, menu); edite aqui
      repositories/        Implementação estática do contrato
    presentation/          Interface
      shared/              Peças reutilizáveis: site-nav, ammo, grain, boot-screen (tela de carregamento;
                           a marcação dela fica em src/index.html)
      sections/hero/       Hero: monta a cena e conduz o loop (+ hero.scene.ts com os números)
        parts/             Uma pasta por peça: backdrop, train, riders, mesa, portrait, title, ground, ctas
```

A camada `presentation` nunca importa de `data`: ela pede o conteúdo ao domínio (`PortfolioRepository`), e o
`app.config.ts` decide qual implementação entregar.
