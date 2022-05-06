import parse from 'date-fns/parse';
import format from 'date-fns/format';
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
    return `${formatDate(startDate as string)} alkaen`;
  }

  if (!startDate) {
    return `${formatDate(endDate)} asti`;
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

export const transformDateToApiFormat = (formDate: string): string =>
  format(parseFormDate(formDate), dateApiFormat);

export const dropMilliseconds = (time: string): string => time.slice(0, -3);

type WeekdayIndexToShortNameMappings = {
  [language in Language]: {
    [weekdayType in WeekdayTypes]: string;
  };
};

const weekdays: WeekdayIndexToShortNameMappings = {
  fi: {
    1: 'ma',
    2: 'ti',
    3: 'ke',
    4: 'to',
    5: 'pe',
    6: 'la',
    7: 'su',
  },
  sv: {
    1: 'Mån',
    2: 'Tis',
    3: 'Ons',
    4: 'Tors',
    5: 'Fre',
    6: 'Lör',
    7: 'Sön',
  },
  en: {
    1: 'Mon.',
    2: 'Tue.',
    3: 'Wed.',
    4: 'Thu.',
    5: 'Fri.',
    6: 'Sat.',
    7: 'Sun.',
  },
};

export function getWeekdayShortNameByIndexAndLang({
  weekdayIndex,
  language,
}: {
  weekdayIndex: WeekdayTypes;
  language: Language;
}): string {
  return weekdays[language][weekdayIndex];
}

type WeekdayIndexToLongNameMappings = {
  [language in Language]: {
    [weekdayType in WeekdayTypes]: string;
  };
};

const weekdaysLong: WeekdayIndexToLongNameMappings = {
  fi: {
    1: 'maanantai',
    2: 'tiistai',
    3: 'keskiviikko',
    4: 'torstai',
    5: 'perjantai',
    6: 'lauantai',
    7: 'sunnuntai',
  },
  sv: {
    1: 'Måndag',
    2: 'Tisdag',
    3: 'Onsdag',
    4: 'Torsdag',
    5: 'Fredag',
    6: 'Lördag',
    7: 'Söndag',
  },
  en: {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday',
  },
};

export function getWeekdayLongNameByIndexAndLang({
  weekdayIndex,
  language,
}: {
  weekdayIndex: WeekdayTypes;
  language: Language;
}): string {
  return weekdaysLong[language][weekdayIndex];
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

  weekdayIndexArray.sort();

  const weekdaySpans: WeekdaySpan[] = [];
  let first = true;
  weekdayIndexArray.forEach((weekdayIndex) => {
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
