# Portfólio — João Pedro · Desenvolvedor FullStack

Identidade **"Fronteira"**: western sofisticado, no estilo de cartaz de ferrovia e gravura impressa. Nada caricato.
Cada tela é limpa e homogênea, com **um foco só**. Deploy na Vercel.

## Fonte da verdade visual

- `docs/reference/hero-referencia.html` foi o ponto de partida aprovado da Hero (cores, geometria SVG, animações,
  interações). Não redesenhe nem "melhore" o que não foi pedido: a Hero só muda por pedido explícito do João.
- Mudanças pedidas pelo João depois da referência:
  1. Sem manifesto/bio e sem rodapé (stack, "5 segredos", "Pausar movimento"). O cargo ("Desenvolvedor FullStack") fica logo abaixo do nome, com destaque.
  2. Nome em **Ultra** (Clarendon de cartaz), terminando acima da linha do trem (o trem nunca passa por trás do nome).
  3. **Sem logo na navegação** (o menu fica à direita). Um **chapéu de cowboy inclinado** (`#fr-hat`, `.fr-hat`)
     fica pousado no "O" de Pedro, a última letra do nome. O favicon (`public/favicon.svg`) continua com o
     monograma JP e o mesmo chapéu na ponta do P.
  4. Menu: no lugar dos numerais romanos, **balas de revólver** (`#fr-bullet`): o capítulo N mostra N balas.
  5. Trem de **passageiros** (2 vagões com janelas e gente sentada) perseguido por **3 pistoleiros a cavalo**.
     Com o Piuí, o trem dispara e eles ficam para trás, depois alcançam de novo. O trem é simétrico e detalhado:
     vagões com lanternim, faixa, plataformas e 2 truques; tênder com carvão; locomotiva com cabine atrás, domo,
     chaminé e farol na frente, rodas motrizes com raios que giram e biela; **engates entre todos os carros**.
     **Desistência:** se o trem abrir mais de `GIVE_UP.gap` (Piuí várias vezes), cada pistoleiro freia, empina
     atirando para o alto, dá meia-volta e vai embora pela esquerda; espera fora da tela e volta atrás do trem
     quando ele dá a volta. Nunca há teletransporte na tela: tudo some e reaparece fora do trecho visível.
  6. CTAs ("Ver projetos" / "Entrar em contato") à esquerda, alinhados ao nome, no chão.
  7. Foto num **cartão** moderno (`.fr-card`): cantos arredondados, sombra suave, foto em sépia suave
     (duotone ink → marrom → paper), na frente do sol. Sem flutuar: só inclina em 3D seguindo o mouse (máx. ~18°),
     com um brilho que acompanha a inclinação. (Cartaz e placa de "procurado" foram testados e recusados.)
  8. **Sem segredos/easter eggs** (duelo, pôr do sol/tema lua, howdy, marca de ferro, toast). O cacto é só cenário.
     A única interação da cena é o **Piuí**: clicar no trem faz ele acelerar e apitar (não é um "segredo").
     Clicar com o mouse não deixa o contorno de foco (`mousedown` com `preventDefault`); pelo teclado ele aparece.
  9. Sem o upload de foto de teste da referência: o retrato não é clicável.
  10. **Tiro perdido** (automático, não é interação): a cada passagem do trem, quando o pistoleiro da frente chega
      perto do "L" de FullStack (`.fr-l`, o último L do cargo), um tiro escapa (clarão + rastro `.fr-shot`) e acerta
      a letra. Ela alterna entre **pendurada balançando** (`.is-hanging`) e **consertada** (`.is-fixing`), num ciclo
      infinito. Números em `STRAY_SHOT` (`hero.scene.ts`); lógica em `moveStrayShot()` (`parts/riders/riders.ts`).
  11. **Tela de carregamento** a cada carregamento da página: papel liso (`--c-paper`), um revólver de ação simples
      e 6 balas em fila que sobem uma por vez e entram no tambor (que gira um clique a cada bala). Fica no mínimo
      ~1,5s e até a Hero estar pronta (fontes); se demorar, o tambor segue girando. Na saída o cão arma e dispara
      (clarão ocre) e a tela sobe como uma cortina, com a entrada da Hero começando junto. Movimento reduzido:
      sem animação, só um fade rápido. Marcação em `src/index.html` (precisa aparecer antes do Angular), estilo e
      lógica em `presentation/shared/boot-screen/`; a Hero chama `BootScreen.dismiss()` antes de `enter()`.
- Correções de bug sobre a referência:
  1. O duotone da foto fica num wrapper (`.fr-photo`). Na referência a animação "develop" terminava em `filter:none`.
  2. Com movimento reduzido (classe `.is-reduced`), todas as animações CSS ficam desligadas e tudo aparece já no
     estado final; o loop JS nem é iniciado. (Na referência, a entrada e o menu mobile congelavam em `opacity:0`.)

## Princípios

1. **Menos é mais.** Não adicione elementos, ícones, contadores, números ou animações que não estejam na referência.
2. **Animação com propósito.** A entrada dura ~2,2s e é **homogênea**: tudo usa o mesmo movimento (`fr-up`: sobe 40px e
   aparece), a mesma duração (`--enter`) e um degrau fixo (`--step`) de trás para a frente; as letras do nome sobem
   de dentro do recorte da linha, e o til e o chapéu sobem junto com a letra deles (nada aparece antes da hora). No ambiente só o trem e os pistoleiros se movem (mais o "L" que o tiro
   perdido pendura e conserta), além de uma paralaxe sutil (máx. 14px), que também inclina o cartão da foto. `prefers-reduced-motion` desliga entrada e movimento (CSS e loop JS).
3. **Acessível.** Elementos SVG clicáveis têm `role="button"`, `tabindex` e Enter/Espaço. O foco é visível (`--c-focus`).

## Stack

- **Angular 22** (standalone, signals, zoneless, `OnPush`) + TypeScript. CSS puro, **sem** Tailwind, UI kit ou lib de
  animação. Bootstrap só se for realmente necessário, e apenas para grid e utilitários.
- Fontes self-hosted via **Fontsource**, importadas em `src/styles/global.css`. Prettier configurado no `package.json`.
- Comandos: `npm start` (http://localhost:4200) e `npm run build` (saída em `dist/portfolio-jp/browser`).

## Arquitetura (Clean Architecture)

A raiz guarda só o que as ferramentas exigem ali (angular.json, package.json, lock, .editorconfig, .gitignore, README).

```
.claude/CLAUDE.md          Este guia.
docs/reference/            Referências visuais aprovadas (HTML soltos).
docs/photos/               Fotos originais (eucortado.png → recortada em public/foto.jpg).
public/                    Servido como está.
src/
  tsconfig.json            Único tsconfig (strict). Atalhos: @domain/*, @data/*, @presentation/*.
  styles/global.css        Fontes (Fontsource), tokens e base global (resets, foco).
  styles/tokens.css        Cores, fontes e easing em :root (valem para qualquer componente).
  app/
    app.ts                 Raiz: empilha as seções.
    app.config.ts          Liga os contratos às implementações.
    domain/
      entities/            Uma entidade por arquivo (profile.ts, chapter.ts).
      repositories/        Contratos (portfolio.repository.ts: classe abstrata PortfolioRepository).
    data/
      content/             Conteúdo pessoal (portfolio.content.ts: PROFILE, CHAPTERS).
      repositories/        Implementações dos contratos (static-portfolio.repository.ts).
    presentation/
      shared/              Peças reutilizáveis em qualquer seção ou página.
        site-nav/          Navegação (menu de capítulos + menu em tela cheia no mobile).
        ammo/              Munição (N balas = capítulo N).
        grain/             Granulado de papel por cima da seção.
        boot-screen/       Tela de carregamento: boot-screen.ts (saída) e boot-screen.css (no angular.json).
                           A marcação fica em src/index.html.
      sections/<secao>/    Uma pasta por seção do site; a seção só monta e conduz as suas peças.
        hero/              hero.ts (layout, entrada e o único loop rAF), hero.html, hero.css (palco e entrada),
                           hero.scene.ts (números e elenco da cena).
          parts/           Uma pasta por peça: backdrop (sol e montanhas), train, riders (e tiro perdido),
                           mesa, portrait (cartão da foto), title (nome, chapéu e cargo), ground (cacto e chão), ctas.
```

Regras:
- `presentation` **nunca** importa de `data`; consome o `domain` via `inject(PortfolioRepository)`.
- Conteúdo pessoal (nome, cargo, textos, stack, capítulos) vive em `data/content/`. Microcopy de UI pode ficar no template.
- Imports entre camadas usam os atalhos (`@domain/...`); dentro da mesma pasta, caminho relativo.
- Sem `.spec` (não há runner de testes), sem barrels, sem serviços que só repassam dados.
- Uma peça = um componente. O que pode servir a outra seção vai para `presentation/shared/`. Peças animadas não
  têm loop próprio: expõem `step()`/`parallax()`/`tilt()` e a seção chama a cada frame.
- Componentes no padrão novo: `nome.ts`, `nome.html`, `nome.css` (+ `nome.scene.ts` se houver cena configurável). Código em inglês, interface em pt-BR.
- CSS da Hero: global com prefixo **`fr-`** (`ViewEncapsulation.None`), escopado por `.fr-hero`. Seções novas seguem
  o mesmo prefixo.

## Layout: o "palco"

- **Desktop (≥ 720px):** palco fixo de 1440×900 unidades, escalado com `s = min(W/1440, H/900)` e alinhado embaixo e
  ao centro. Dentro dele, tudo fica em px absolutos. As camadas SVG vão de x=-1440 a 2880 para preencher telas largas.
- **Mobile (< 720px):** mesma cena numa janela de 400 unidades centrada em x=790, com `s = W/400`. O palco tem
  880 de altura, e a Hero passa a ter altura 880·s. Posições específicas em `[data-mode="m"]`.
- A navegação fica fora do palco, em px reais. Recalcular com `ResizeObserver`.

## Tipografia

| Token         | Fonte                    | Uso                                              |
|---------------|--------------------------|--------------------------------------------------|
| `--f-display` | Ultra 400                     | Nome, títulos, menu mobile     |
| `--f-sans`    | Instrument Sans 400/500/600   | Cargo, texto corrido, botões, menu           |
| `--f-mono`    | JetBrains Mono 500            | Rótulos pequenos                             |

Nenhuma outra fonte. (Instrument Serif saiu junto com o toast; reinstale via Fontsource se uma seção precisar.)

## Cores (tokens em `.fr-hero`)

Tema único, claro. Cada `--c-*` aceita override por `--paper`, `--ink` etc.

| token | valor |
|---|---|
| paper | #f1e7d3 |
| paper-raised | #f8f1e3 |
| sand | #e3cba2 |
| ink | #1e1612 |
| ink-muted | #5e4c3f |
| ground | #1e1612 |
| on-ground | #f1e7d3 |
| on-ground-muted | #b9a58c |
| rust | #a8401f |
| on-rust | #fbf4e8 |
| ochre | #d08a2e |
| mesa | #c9733f |
| line | #cdb896 |
| focus | #1f6f6a |

Regras: `rust` só no sol e no botão principal. Sobre o chão (`ground`), texto só em `on-ground` / `on-ground-muted`.
Easing padrão: `--e-out: cubic-bezier(.22,1,.36,1)`.

## Roteiro de seções (uma por vez)

As âncoras já estão no menu, mas ainda não levam a lugar nenhum: `#quem-sou` (Quem sou), `#alforje` (Ferramentas),
`#trilhos` (Projetos), `#jornada` (Jornada), `#telegrama` (Contato).

## Assets

- `public/foto.jpg`: retrato da Hero (690×902, recortado de `docs/photos/eucortado.png`, com duotone sépia). Se
  não existir, aparece o placeholder "Sua foto aqui".
