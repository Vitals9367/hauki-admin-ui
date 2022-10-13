import Holidays, { HolidaysTypes } from 'date-holidays';
import { Holiday as THoliday } from '../common/lib/types';

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

// eslint-disable-next-line import/prefer-default-export
export const getHolidays = (): THoliday[] => {
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
    .map((year) => ({
      fi: hd.getHolidays(year, 'fi'),
      sv: hd.getHolidays(year, 'sv'),
      en: hd.getHolidays(year, 'en'),
    }))
    .reduce(
      (
        acc: {
          fi: HolidaysTypes.Holiday;
          sv: HolidaysTypes.Holiday;
          en: HolidaysTypes.Holiday;
        }[],
        elem
      ) =>
        [
          ...acc,
          elem.fi.map((date, i) => ({
            fi: date,
            sv: elem.sv[i],
            en: elem.en[i],
          })),
        ].flat(),
      []
    )
    .map(({ fi, sv, en }) => ({
      date: fi.date.split(' ')[0],
      name: {
        fi: fi.name,
        // There is a bug in the holidays lib
        sv: fi.name === 'Isänpäivä' ? 'Fars dag' : sv.name,
        en: en.name,
      },
    }))
    .filter((date) => date.date >= start && date.date <= end);
};
