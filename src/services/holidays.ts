import Holidays from 'date-holidays';
import { Holiday } from '../common/lib/types';

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

// eslint-disable-next-line import/prefer-default-export
export const getHolidays = (): Holiday[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const start = formatDate(now);
  const later = new Date();
  const nextYear = currentYear + 1;
  later.setFullYear(nextYear);
  const end = formatDate(later);

  const hd = new Holidays();
  hd.init('FI');

  return [currentYear, currentYear + 1]
    .map((year) => hd.getHolidays(year))
    .flat()
    .map((date) => ({
      date: date.date.split(' ')[0],
      name: date.name,
    }))
    .filter((date) => date.date >= start && date.date <= end);
};
