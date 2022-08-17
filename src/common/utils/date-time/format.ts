import parse from 'date-fns/parse';
import format from 'date-fns/format';
import { getDay } from 'date-fns';
import { Language, Weekdays, WeekdayTypes } from '../../lib/types';

export const dateApiFormat = 'yyyy-MM-dd';
export const dateFormFormat = 'dd.MM.yyyy';
export const datetimeFormFormat = `${dateFormFormat} HH:mm`;

export const formatDate = (
  date: string,
  dateFormatStr: string | undefined = dateFormFormat
): string => format(new Date(date), dateFormatStr);

export const parseFormDate = (date: string): Date =>
  parse(date, dateFormFormat, new Date());

export const formatDateRange = ({
  startDate,
  endDate,
}: {
  startDate: string | null;
  endDate: string | null;
}): string => {
  if (!startDate && !endDate) {
    return 'Voimassa toistaiseksi';
  }

  if (!endDate) {
    return `Voimassa ${startDate} alkaen`;
  }

  if (!startDate) {
    return `Voimassa ${endDate} asti`;
  }

  return `Voimassa ${startDate} - ${endDate}`;
};

export const transformDateToApiFormat = (formDate: string): string =>
  format(parseFormDate(formDate), dateApiFormat);

export const dropMilliseconds = (time: string): string => time.slice(0, -3);

type WeekdayIndexToShortNameMappings = {
  [language in Language]: {
    [weekdayType in WeekdayTypes]: [string, string];
  };
};

const weekdays: WeekdayIndexToShortNameMappings = {
  fi: {
    1: ['ma', 'Maanantai'],
    2: ['ti', 'Tiistai'],
    3: ['ke', 'Keskiviikko'],
    4: ['to', 'Torstai'],
    5: ['pe', 'Perjantai'],
    6: ['la', 'Lauantai'],
    7: ['su', 'Sunnutai'],
  },
  sv: {
    1: ['Mån', 'Måndag'],
    2: ['Tis', 'Tisdag'],
    3: ['Ons', 'Onsdag'],
    4: ['Tors', 'Torsdag'],
    5: ['Fre', 'Fredag'],
    6: ['Lör', 'Lördag'],
    7: ['Sön', 'Söndag'],
  },
  en: {
    1: ['Mon.', 'Monday'],
    2: ['Tue.', 'Tuesday'],
    3: ['Wed.', 'Wednesday'],
    4: ['Thu.', 'Thursday'],
    5: ['Fri.', 'Friday'],
    6: ['Sat.', 'Saturday'],
    7: ['Sun.', 'Sunday'],
  },
};

export function getWeekdayShortNameByIndexAndLang({
  weekdayIndex,
  language,
}: {
  weekdayIndex: WeekdayTypes;
  language: Language;
}): string {
  return weekdays[language][weekdayIndex][0];
}

export function getWeekdayLongNameByIndexAndLang({
  weekdayIndex,
  language,
}: {
  weekdayIndex: WeekdayTypes;
  language: Language;
}): string {
  return weekdays[language][weekdayIndex][1];
}

type WeekdaySpan = {
  startIndex: number;
  lastInsertedIndex: number;
  endIndex?: number;
};

export function createWeekdaysStringFromIndices(
  weekdayIndexArray: Weekdays | number[] | null,
  language: Language
): string {
  if (!weekdayIndexArray) {
    return '';
  }

  const weekdaySpans: WeekdaySpan[] = [];
  let first = true;
  [...weekdayIndexArray]
    .sort((a, b) => a - b)
    .forEach((weekdayIndex) => {
      if (first) {
        weekdaySpans.push({
          startIndex: weekdayIndex,
          lastInsertedIndex: weekdayIndex,
        });
        first = false;
      } else {
        const currentObject = weekdaySpans[weekdaySpans.length - 1];
        if (weekdayIndex - 1 === currentObject.lastInsertedIndex) {
          currentObject.endIndex = weekdayIndex;
          currentObject.lastInsertedIndex = weekdayIndex;
        } else {
          weekdaySpans.push({
            startIndex: weekdayIndex,
            lastInsertedIndex: weekdayIndex,
          });
        }
      }
    });

  let weekdaysString = '';
  weekdaySpans.forEach((weekdaySpanObject: WeekdaySpan, index: number) => {
    if (weekdaySpanObject.endIndex) {
      weekdaysString += `${getWeekdayShortNameByIndexAndLang({
        weekdayIndex: weekdaySpanObject.startIndex,
        language,
      })} - ${getWeekdayShortNameByIndexAndLang({
        weekdayIndex: weekdaySpanObject.endIndex,
        language,
      })}`;
    } else {
      weekdaysString += `${getWeekdayShortNameByIndexAndLang({
        weekdayIndex: weekdaySpanObject.startIndex,
        language,
      })}`;
    }

    if (!(index === weekdaySpans.length - 1)) {
      weekdaysString += `, `;
    }
  });

  return weekdaysString;
}

export const getNumberOfTheWeekday = (date: string): number => {
  // Date-fns returns index and it starts from Sunday.
  const dateFnsWeekdayIndex: number = getDay(new Date(date));
  return dateFnsWeekdayIndex === 0 ? 7 : dateFnsWeekdayIndex;
};
