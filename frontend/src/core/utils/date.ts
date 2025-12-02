import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    return '-';
  }
}
