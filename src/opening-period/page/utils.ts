import { Weekdays, WeekdayTypes } from '../../common/lib/types';
import { daysOrder } from './constants';
import { Days, OpeningHoursRange } from './types';

export const toWeekdays = (days: Days): Weekdays =>
  Object.entries(days)
    .filter((entry) => entry[1])
    .map((entry) => {
      switch (entry[0]) {
        case 'Ma':
          return WeekdayTypes.MONDAY;
        case 'Ti':
          return WeekdayTypes.TUESDAY;
        case 'Ke':
          return WeekdayTypes.WEDNESDAY;
        case 'To':
          return WeekdayTypes.THURSDAY;
        case 'Pe':
          return WeekdayTypes.FRIDAY;
        case 'La':
          return WeekdayTypes.SATURDAY;
        case 'Su':
          return WeekdayTypes.SUNDAY;
        default:
          throw new Error('Invalid day');
      }
    });

export const sortOpeningHours = (
  openingHours: OpeningHoursRange[]
): OpeningHoursRange[] =>
  [...openingHours].sort((a, b) => {
    const findSelectedDate = (days: Days): string | undefined =>
      (Object.entries(days).find((entry) => entry[1]) || [])[0];

    const day1 = findSelectedDate(a.days);

    if (!day1) {
      throw new Error('Cannot find day for comparison');
    }

    const day2 = findSelectedDate(b.days);

    if (!day2) {
      throw new Error('Cannot find day for comparison');
    }

    return daysOrder.indexOf(day1) - daysOrder.indexOf(day2);
  });
