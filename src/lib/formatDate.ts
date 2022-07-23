import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export function formatDate(date: string): string {
  const formattedDate = format(new Date(date), "dd' 'MMMM' 'yyyy", {
    locale: ptBR,
  }).split(' ');

  const formattedDateMonth = formattedDate.reduce((acc, value, index) => {
    let currentAcc = acc;

    if (index !== 1) {
      currentAcc += value;
    } else {
      currentAcc += ` ${value.slice(0, 3)} `;
    }

    return currentAcc;
  }, '');

  return formattedDateMonth;
}
