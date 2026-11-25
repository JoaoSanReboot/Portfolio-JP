import { AboutMeContent } from '@domain/entities/about-me';

/*
 * Conteúdo do capítulo "Sobre mim". Para mudar os textos, edite aqui, sem mexer nos componentes.
 * Os campos estão explicados em domain/entities/about-me.ts.
 */
export const ABOUT_ME: AboutMeContent = {
  // ---------- Trilho do topo ----------
  trilho: 'Sobre mim',

  // ---------- Abertura ----------
  titulo: 'Sobre mim',
  paragrafos: [
    'Olá, Forasteiro! Prazer em conhecê-lo.',
    'Como pode perceber, sou bastante fã do Velho Oeste, seja pelas histórias do cangaço, pelos filmes ou pelos jogos que retratam esse universo. Mas, para além do oeste, também sou apaixonado por tecnologia.',
    'Minha curiosidade por computadores começou justamente pela vontade de explorar, mexer naquilo que ainda não conhecia e descobrir como as coisas funcionavam. Com o tempo, essa curiosidade se transformou em estudo, projetos e uma jornada que sigo construindo até hoje, sempre em busca de novos conhecimentos.',
    'Fique à vontade para explorar meus projetos, conhecer um pouco do que construí e descobrir mais sobre quem está por trás deste pistoleiro.',
  ],

  // ---------- Fogueira ----------
  ilustracao: {
    descricao:
      'Ilustração: uma fogueira acesa à noite, com uma chaleira no tripé e dois copos ao lado',
    legenda: 'Sente-se e sirva-se.',
  },
};
