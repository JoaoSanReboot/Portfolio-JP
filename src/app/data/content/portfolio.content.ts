import { Chapter } from '@domain/entities/chapter';
import { Profile } from '@domain/entities/profile';

/*
 * Conteúdo pessoal do site. Para mudar nome, cargo, foto ou menu, edite aqui.
 */

/** Quem é o dono do portfólio. */
export const PROFILE: Profile = {
  name: 'João Pedro',
  role: 'Desenvolvedor FullStack',
  stack: ['C#', '.NET', 'ASP.NET Core', 'SQL Server', 'Azure DevOps'],
  photoUrl: 'foto.jpg',
  highlight: 'o grid de contratos que otimizei caiu de 60.000 ms para 4.000 ms',
};

/** Capítulos do menu, na ordem do site. As âncoras são os ids das seções (ainda por construir). */
export const CHAPTERS: readonly Chapter[] = [
  { label: 'Quem sou', anchor: 'quem-sou' },
  { label: 'Ferramentas', anchor: 'alforje' },
  { label: 'Projetos', anchor: 'trilhos' },
  { label: 'Jornada', anchor: 'jornada' },
  { label: 'Contato', anchor: 'telegrama' },
];
