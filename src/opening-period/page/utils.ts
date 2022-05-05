/* eslint-disable import/prefer-default-export */
import { Weekdays, WeekdayTypes } from '../../common/lib/types';
import { Days, OpeningHoursRange } from './types';

export const toWeekdays = (days: Days): Weekdays =>
  Object.entries(days)
    .filter((entry) => entry[1])
    .map((entry) => {
      switch (+entry[0]) {
        case 1:
          return WeekdayTypes.MONDAY;
        case 2:
          return WeekdayTypes.TUESDAY;
        case 3:
          return WeekdayTypes.WEDNESDAY;
        case 4:
          return WeekdayTypes.THURSDAY;
        case 5:
          return WeekdayTypes.FRIDAY;
        case 6:
          return WeekdayTypes.SATURDAY;
        case 7:
          return WeekdayTypes.SUNDAY;
        default:
          throw new Error('Invalid day');
      }
    });

export const sortOpeningHours = (
  openingHours: OpeningHoursRange[]
): OpeningHoursRange[] =>
  [...openingHours].sort((a, b) => {
    const findSelectedDate = (days: Days): number | undefined => {
      const [day] = Object.entries(days).find((entry) => entry[1]) || [];

      if (day) {
        return +day;
      }

      return undefined;
    };

    const day1 = findSelectedDate(a.days);

    if (!day1) {
      throw new Error('Cannot find day for comparison');
    }

    const day2 = findSelectedDate(b.days);

    if (!day2) {
      throw new Error('Cannot find day for comparison');
    }

    return day1 - day2;
  });
