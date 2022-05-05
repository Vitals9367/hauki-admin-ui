/* eslint-disable import/prefer-default-export */
import { OpeningHoursRange } from './types';

export const sortOpeningHours = (
  openingHours: OpeningHoursRange[]
): OpeningHoursRange[] =>
  [...openingHours].sort((a, b) => {
    const day1 = a.days.sort()[0];
    const day2 = b.days.sort()[0];

    return day1 - day2;
  });
