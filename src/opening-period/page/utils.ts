import { Weekdays, WeekdayTypes } from '../../common/lib/types';
import { Days } from './types';

// eslint-disable-next-line import/prefer-default-export
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
