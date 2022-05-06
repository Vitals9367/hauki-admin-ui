import { isEqual } from 'lodash';
import { OpeningHoursRange } from './types';

const sortOpeningHours = (
  openingHours: OpeningHoursRange[]
): OpeningHoursRange[] =>
  [...openingHours].sort((a, b) => {
    const day1 = a.days.sort()[0];
    const day2 = b.days.sort()[0];

    return day1 - day2;
  });

const openingHoursRangeEqual = (
  o1: OpeningHoursRange,
  o2: OpeningHoursRange
): boolean => {
  if (
    o1.isOpen === o2.isOpen &&
    o1.normal?.length === o2.normal?.length &&
    o1.normal?.every((timeSpan1) =>
      o2.normal?.find((timeSpan2) => isEqual(timeSpan1, timeSpan2))
    )
  ) {
    return true;
  }

  return false;
};

const areConsecutiveDays = (
  openingHour1: OpeningHoursRange,
  openingHour2: OpeningHoursRange
): boolean => openingHour2.days.sort()[0] - openingHour1.days.sort()[0] === 1;

const isWeekend = (openingHour: OpeningHoursRange): boolean =>
  openingHour.days.includes(6) || openingHour.days.includes(7);

const groupByClosestDays = (
  openingHours: OpeningHoursRange[]
): OpeningHoursRange[] => {
  const individualDays: OpeningHoursRange[] = [];

  openingHours.forEach((openingHour) => {
    openingHour.days.forEach((day) => {
      individualDays.push({ ...openingHour, days: [day] });
    });
  });

  const groups: OpeningHoursRange[][] = [[]];
  let i = 0;

  individualDays
    .sort((a, b) => {
      return a.days[0] - b.days[0];
    })
    .forEach((openingHour, idx, arr) => {
      groups[i].push(openingHour);

      if (idx === arr.length - 1) {
        return;
      }

      const nextOpeningHour = arr[idx + 1];

      if (
        !isWeekend(nextOpeningHour) &&
        areConsecutiveDays(openingHour, nextOpeningHour) &&
        openingHoursRangeEqual(openingHour, nextOpeningHour)
      ) {
        return;
      }

      i += 1;
      groups[i] = [];
    });

  return groups.reduce((result, group) => {
    return [
      ...result,
      group.reduce(
        (newOpeningHour, openingHour) => {
          return {
            ...openingHour,
            days: [...newOpeningHour.days, ...openingHour.days],
          };
        },
        { days: [] }
      ),
    ];
  }, []);
};

// eslint-disable-next-line import/prefer-default-export
export const groupOpeningHoursForPreview = (
  openingHours: OpeningHoursRange[]
): OpeningHoursRange[] =>
  sortOpeningHours(groupByClosestDays(openingHours.filter((o) => o)));
