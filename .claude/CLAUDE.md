# Portfólio — João Pedro · Desenvolvedor FullStack

Portfólio profissional de um desenvolvedor Fullstack, com identidade visual inspirada no **Velho Oeste americano e elementos do sertão nordestino e do cangaço**.
O objetivo é reunir informações sobre o desenvolvedor, seus projetos, habilidades e contatos em um site moderno, limpo e consistente, utilizando o tema de forma equilibrada,
com visual marcante e animações sutis, sem exageros de informações ou caricaturas.

- **Stack:** Angular 22 (standalone, signals, zoneless, `OnPush`) + TypeScript strict + CSS puro.
- **Não usar:** Tailwind, UI kit, lib de animação ou router (a navegação é por âncoras). Bootstrap só se for
  indispensável, e apenas grid/utilitários.
- **Comandos:** `npm start` (http://localhost:4200) · `npm run build` (saída em `dist/portfolio-jp/browser`).
- Não há testes automatizados. Antes de concluir, rode `npm run build` e confira desktop, mobile e movimento reduzido.

## 1. Como trabalhar neste projeto

1. **Fazer somente o solicitado.** Não redesenhe, não "melhore" e não acrescente elementos, ícones, textos ou animações.
2. **O código atual é a fonte da verdade.** Os HTMLs de `docs/reference/` são o ponto de partida visual
3. **Reutilize antes de criar:** veja `presentation/shared/`, `colors-and-fonts.css` e `chapter-base.css`.
4. **Criando um seção por vez**.
5. **Este arquivo é um manual.** Ele descreve como o projeto *é*. Atualize-o quando uma regra, pasta ou
   comportamento mudar, reescrevendo o trecho. Nunca registre pedidos, histórico, versões antigas ou correções.

## 2. Como o código funciona

```
abertura:  index.html → main.ts → app.config.ts → app.ts 

conteúdo:  data/content → StaticPortfolioRepository → PortfolioRepository → seção → peças
           (textos)       (implementação)             (contrato)            (inject)  (input)
```

1. **Conteúdo:** todo texto pessoal vive em `data/content/`. A seção pede ao contrato com
   `inject(PortfolioRepository)` e repassa às peças por `input()`. Para trocar a fonte (ex.: uma API), muda só o
   `useClass` em `app.config.ts`.
2. **Seção:** monta as peças no template e é a única dona do `requestAnimationFrame` (item 6).
3. **Peças:** recebem dados por `input()`, desenham e expõem métodos que a seção chama (`step()`, `parallax()`...).
4. **Abertura da página:** fontes prontas → `LoadingScreen.dismiss()` → a cortina sobe → `MainPage.enter()` põe `.is-in` (o
   CSS faz a entrada) → após `SETTLE_MS` põe `.is-settled`, e só então começam a paralaxe e o tiro perdido.
5. **Navegação:** `NavigationMenu` recebe `CHAPTERS`; `go()` só navega para âncoras que já existem na página.

## 3. Organização dos arquivos

```
.claude/CLAUDE.md          Este manual
docs/reference/            Referências visuais
docs/photos/               Fotos originais
public/                    Servido como está: favicon.svg, profile-photo.jpg
src/
  index.html               Página e marcação da tela de carregamento
  tsconfig.json            Único tsconfig; atalhos @domain/*, @data/*, @presentation/*
  styles/
    global.css             Fontes (Fontsource), resets e foco
    colors-and-fonts.css   Cores, fontes e easing
    chapter-base.css       Base dos capítulos: .fr-chapter, .fr-k (rótulo), .fr-reveal (aparece no scroll)
    campfire-animations.css  Chama, faísca e vapor (compartilhadas)
  app/
    app.ts                 Raiz: empilha as seções
    app.config.ts          Liga os contratos às implementações
    domain/                Sem Angular
      entities/            Uma entidade por arquivo
      repositories/        Contratos (classes abstratas)
    data/
      content/             Textos: profile-and-menu.ts (nome, cargo, menu) e um arquivo por seção
      repositories/        Implementações dos contratos
    presentation/
      shared/              Peças que servem a mais de uma seção
        chapter-bullets/   N balas de revólver (numeral do capítulo N)
        block-header/      Cabeçalho de bloco: letra, título e rótulo (disponível, sem uso)
        loading-screen/    Tela de carregamento: estilo (incluído no angular.json) e saída
        campfire-closing/  Fechamento de capítulo com fogueira (disponível, sem uso)
        paper-texture/     Granulado de papel sobre a seção
        rail-divider/      Trilho que abre um capítulo, com as balas e o nome
        reveal-on-scroll/  Diretiva appRevealOnScroll: põe .is-seen quando o elemento entra na tela
        navigation-menu/   Menu do topo e menu em tela cheia do mobile
      sections/<secao>/    Uma pasta por seção: <secao>.ts, .html, .css (+ <secao>.scene.ts se houver cena)
        parts/<peca>/      Uma pasta por peça da seção
```

Regras:
- **Tudo em pastas:** cada componente tem a própria pasta, com `nome.ts`, `nome.html` e `nome.css`.
- **Serve a outra seção ou página? Arquivo próprio em `presentation/shared/`** (ou em `styles/`, se for só estilo).
  Só uma seção usa? Fica em `parts/` dela.
- **Nomes objetivos e claros**, em kebab-case, que digam o que a peça é.
- **`presentation` nunca importa de `data`**; `domain` não importa das outras camadas.
- Imports com atalho entre camadas e para `@presentation/shared`; dentro da mesma seção (ou de `shared/`), relativos.
- A raiz do repositório guarda só o que as ferramentas exigem ali.
- Não criar: `.spec`, barrels (`index.ts`) ou serviços que só repassam dados.

## 4. Padrão de código

```ts
/**
 * O que a peça é, o que faz e quem a conduz.
 *
 * Uso: `<app-exemplo [content]="content.exemplo" />`
 */
@Component({
  selector: 'app-exemplo',
  templateUrl: './exemplo.html',
  styleUrl: './exemplo.css',
  encapsulation: ViewEncapsulation.None, // CSS global, com prefixo fr-
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Exemplo {
  readonly content = input.required<ExemploContent>();
}
```

- **Idioma:** código, arquivos e pastas em inglês, com nomes explícitos (`AboutMe`, `main-page`); interface e
  comentários em pt-BR. Os campos do conteúdo dos capítulos ficam em português (`paragrafos`, `titulo`).
- **Limpo:** uma peça = um componente = uma responsabilidade. Métodos curtos, sem código morto e sem número mágico
  (constantes nomeadas no topo do arquivo ou em `*.scene.ts`).
- **Comentado:** classes, constantes e blocos dizem para que servem; em trechos não óbvios, explique o **porquê**. CSS
  dividido em blocos (`/* ---------- Nome ---------- */`). Comentário descreve o presente, nunca o histórico.
- **Angular:** `input()`, `signal()`, `computed()`, `viewChild()`, `inject()`, `@if`/`@for`. O que muda a cada frame
  **não** passa por signal: escreve direto no DOM. Observers, timers e frames são limpos com `DestroyRef`.
- **CSS:** classes e keyframes com prefixo `fr-` (nas seções, abreviado: `fr-about-`). Cores e fontes por variável
  (`var(--c-*)`, `var(--f-*)`). Ids de SVG com `fr-` e únicos na página.
- **Formatação:** Prettier (config no `package.json`), 100 colunas, aspas simples.
- **Limites do build (aviso):** 500 kB de bundle inicial; 20 kB de CSS por componente.

### Receita: nova seção

1. `domain/entities/<secao>.ts`: interface do conteúdo.
2. `data/content/<secao>.ts`: textos.
3. Método novo em `PortfolioRepository` e em `StaticPortfolioRepository`.
4. `presentation/sections/<secao>/`: `<section class="fr-chapter fr-<secao>" id="<ancora>">`, com `<app-paper-texture />` como
   primeiro filho, `<app-rail-divider />` em seguida e uma peça por bloco em `parts/`.
5. Adicionar em `app.ts`, na ordem do menu. A âncora é a que está em `CHAPTERS`.

## 5. Design

### Cores (`src/styles/colors-and-fonts.css`)

| Token | Valor | Uso |
|---|---|---|
| `--c-paper` | `#f1e7d3` | Fundo de papel |
| `--c-raised` | `#f8f1e3` | Papel elevado (molduras) |
| `--c-sand` | `#e3cba2` | Montanhas, detalhes claros |
| `--c-ink` | `#1e1612` | Texto e traços |
| `--c-muted` | `#5e4c3f` | Texto secundário |
| `--c-ground` | `#1e1612` | Chão escuro |
| `--c-on-ground` / `--c-on-ground-muted` | `#f1e7d3` / `#b9a58c` | Únicas cores de texto sobre o chão |
| `--c-rust` / `--c-on-rust` | `#a8401f` / `#fbf4e8` | Destaque / texto sobre ele |
| `--c-ochre` | `#d08a2e` | Luzes, tiros e detalhes das balas |
| `--c-mesa` | `#c9733f` | Planaltos |
| `--c-line` | `#cdb896` | Fios e divisórias |
| `--c-focus` | `#1f6f6a` | Contorno de foco |

- `rust` é raro: sol, botão principal, "PIUÍ!" e fogueira.
- Ao mudar `paper` ou `ground`, atualize também o `theme-color` (`index.html`) e o fundo do `body` (`global.css`).
- A paleta noturna `lua` (`:root[data-theme='lua']`) existe, mas nada a liga: o site não tem troca de tema.

### Tipografia (Fontsource, importada em `global.css`)

| Token | Fonte | Uso |
|---|---|---|
| `--f-display` | Ultra 400 | Página principal (nome, "PIUÍ!") e menu mobile |
| `--f-poster` | Big Shoulders Display 800/900 | Títulos dos capítulos, em maiúsculas |
| `--f-serif` | Instrument Serif itálico 400 | Frases, letras de bloco e legendas |
| `--f-sans` | Instrument Sans 400/500/600 | Cargo, texto corrido, botões, menu |
| `--f-mono` | JetBrains Mono 500 | Rótulos pequenos, em maiúsculas (`.fr-k`) |

Nenhuma outra fonte. Importe só os pesos usados.

### Layout

- **Página principal = palco.** Desktop (≥ 720px): 1440×900 unidades escaladas por `min(W/1440, H/900)`, alinhadas embaixo e ao
  centro; tudo dentro em px absolutos, e os SVGs vazam de x=-1440 a 2880 para telas largas. Mobile (< 720px): janela
  de 400 unidades centrada em x=790, com 880 de altura e posições próprias em `[data-mode='m']`. `MainPage.layout()`
  recalcula com `ResizeObserver`. A navegação fica fora do palco, em px reais.
- **Capítulos = fluxo normal.** Fundo de papel, blocos separados por fios, sem cards com sombra. Quebras em 1100px
  (empilha blocos) e 760px (mobile). Margens por `--pad` e `--pad-end`.

### Acessibilidade

- SVG clicável: `role="button"`, `tabindex="0"`, `aria-label`, Enter e Espaço. Decoração: `aria-hidden="true"`.
- Foco visível no teclado (`--c-focus`). Clicar com o mouse numa peça da cena não deixa contorno (`mousedown` com
  `preventDefault`).

### Fora da identidade (não adicionar)

Easter eggs/segredos (fora o café do "Sobre mim"), troca de tema, logo na navegação, numerais romanos no menu, manifesto/bio ou rodapé na página principal,
cartaz de "procurado", upload de foto, relógio, contadores e enfeites sem função. Nos capítulos: armas, chapéus e
fontes "de faroeste".

## 6. Animações

- **Propósito e calma:** uma animação só existe se conduz o olhar ou dá vida à cena. Feitas com CSS e
  `requestAnimationFrame`.
- **Curvas:** `--e-out` é o padrão; `--e-swing` só para pequenos pulos de hover.
- **O que anima:** de preferência `transform`/`translate`/`rotate`/`scale` e `opacity`.

| Tipo | Como é feito |
|---|---|
| Entrada da página principal (~2,2s) | Coreografia toda em `main-page.css`: elementos `.a` + `.a-<camada>` com o mesmo movimento (`fr-up`: sobe 40px e aparece), a mesma duração (`--enter`) e um degrau (`--step`) por camada, de trás para a frente. As letras do nome sobem do recorte da linha (`fr-letter`), com til e chapéu junto. A foto "revela" (`fr-develop`) e a navegação só aparece (`fr-fade`). Nada surge antes da hora. |
| Entrada dos capítulos | `class="fr-reveal" appRevealOnScroll`: fade + 14px ao entrar na tela, uma vez só. |
| Abertura de capítulo | O título sobe do recorte da linha e o resto (`.r`) aparece escalonado por `--d`. |
| Movimento contínuo simples | Keyframes CSS em laço (galope, fogueira). |
| Movimento com lógica | Loop JS: a **seção** tem o único rAF e a cada frame chama `step()`, `parallax()` ou `tilt()` das peças. Peça nunca tem loop próprio. |

- O tempo vem do `dt`, limitado a 0,05s para nada saltar quando a aba volta do segundo plano.
- Velocidades, tempos e posições ficam em `*.scene.ts` ou numa constante no topo da peça.
- Estados trocam por classe (`.is-in`, `.is-seen`, `.is-hanging`): o JS marca o momento e o CSS anima.
- O loop de um capítulo só roda com a área visível (`IntersectionObserver`).
- Na cena, nada se teletransporta à vista: personagens saem e voltam fora do trecho visível (`StageView`).
- O duotone da foto fica no wrapper `.fr-photo`, porque a entrada anima o `filter` da `<img>`.
- **`prefers-reduced-motion` é obrigatório:** CSS sem animação e já no estado final (`.is-reduced` na página principal, media
  query nos capítulos), e o loop JS nem inicia.

## 7. O que já existe

### Tela de carregamento (`shared/loading-screen`)

Papel liso, um revólver e 6 balas que entram uma a uma no tambor, que gira um clique a cada bala. Fica no mínimo ~1,5s
e até as fontes da página principal estarem prontas; ao sair, o cão arma, dispara e a tela sobe como cortina, junto com a entrada
da página principal. Com movimento reduzido, só um fade rápido.

### Página principal (`sections/main-page`)

- **Composição:** menu à direita (o capítulo N mostra N balas); nome em Ultra, acima da linha do trem, com um chapéu
  inclinado no "O" de Pedro; cargo logo abaixo; CTAs no chão, alinhados ao nome; cartão da foto à direita, na frente
  do sol. O cacto é só cenário.
- **Peças:** `sun-and-mountains`, `train`, `horse-riders`, `plateau`, `photo-card`, `name-and-role`,
  `ground-and-cactus`, `action-buttons`. Os números da cena ficam em `main-page.scene.ts`.
- **Trem:** 2 vagões de passageiros, tênder e locomotiva, ligados por engates; rodas e biela giram conforme a
  distância. **Piuí** (clicar no trem) é a única interação da cena: ele apita e acelera.
- **Pistoleiros:** 3 a cavalo perseguem o trem. Se ele abrir mais de `GIVE_UP.gap`, desistem (freiam, empinam, dão
  meia-volta) e voltam quando o trem dá a volta. Máquina de estados (`Mode`) em `horse-riders.ts`.
- **Tiro perdido** (automático): a cada passagem, o pistoleiro da frente acerta o último "L" de FullStack, que alterna
  entre pendurado (`.is-hanging`) e consertado (`.is-fixing`).
- **Foto:** cartão de cantos arredondados em duotone sépia; não flutua, só inclina com o mouse (máx. 18°) e não é
  clicável. Se a foto não carregar, aparece "Sua foto aqui".
- **Paralaxe:** máx. 14px.

### Capítulo 1, "Sobre mim" (`sections/about-me`)

- **Composição:** trilho (balas e nome); título e texto corrido à esquerda, numa fonte só, e a noite de fogueira com
  legenda à direita (sem foto pessoal).
- **Peças:** `campfire-scene`. Textos em `data/content/about-me.ts`.
- **Fogueira:** círculo de noite com fogo, chaleira no tripé, dois copos no toco e um tronco. O fogo é CSS; os números da
  chaleira e dos copos ficam em `campfire-scene.scene.ts`.
- **Café (easter egg):** arrastar a chaleira até um copo o enche; clique ou Enter/Espaço serve o próximo copo. Com
  movimento reduzido, enche na hora.

## 8. Roteiro

| Capítulo | Âncora | Situação |
|---|---|---|
| Sobre mim | `#quem-sou` | Pronto |
| Ferramentas | `#alforje` | A fazer |
| Projetos | `#trilhos` | A fazer |
| Jornada | `#jornada` | A fazer |
| Contato | `#telegrama` | A fazer |
