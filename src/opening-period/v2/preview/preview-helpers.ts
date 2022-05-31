import { isEqual } from 'lodash';
import { sortOpeningHours } from '../helpers/opening-hours-helpers';
import { OpeningHours, OpeningHoursTimeSpan } from '../types';

const openingHoursRangeEqual = (
  o1: OpeningHours,
  o2: OpeningHours
): boolean => {
  return o1.timeSpanGroups.every((timeSpanGroup1) =>
    o2.timeSpanGroups.find((timeSpanGroup2) => {
      if (timeSpanGroup1.rule !== timeSpanGroup2.rule) {
        return false;
      }

      if (
        timeSpanGroup1.timeSpans?.length === timeSpanGroup2.timeSpans?.length &&
        (timeSpanGroup1.timeSpans || []).every((timeSpan1) =>
          timeSpanGroup2.timeSpans?.find((timeSpan2) =>
            isEqual(timeSpan1, timeSpan2)
          )
        )
      ) {
        return true;
      }

      return false;
    })
  );
};

const areConsecutiveDays = (
  openingHour1: OpeningHours,
  openingHour2: OpeningHours
): boolean =>
  openingHour2.weekdays.sort()[0] - openingHour1.weekdays.sort()[0] === 1;

const groupByConsecutiveDays = (
  openingHours: OpeningHours[]
): OpeningHours[] => {
  const individualDays: OpeningHours[] = [];

  openingHours.forEach((openingHour) => {
    openingHour.weekdays.forEach((day) => {
      individualDays.push({ ...openingHour, weekdays: [day] });
    });
  });

  const groups: OpeningHours[][] = [[]];
  let i = 0;

  individualDays
    .sort((a, b) => {
      return a.weekdays[0] - b.weekdays[0];
    })
    .forEach((openingHour, idx, arr) => {
      groups[i].push(openingHour);

      if (idx === arr.length - 1) {
        return;
      }

      const nextOpeningHour = arr[idx + 1];

      if (
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
      group.reduce((newOpeningHour, openingHour) => {
        return {
          ...openingHour,
          weekdays: [...newOpeningHour.weekdays, ...openingHour.weekdays],
        };
      }),
    ];
  }, []);
};

// eslint-disable-next-line import/prefer-default-export
export const groupOpeningHoursForPreview = (
  openingHours: OpeningHours[]
): OpeningHours[] => sortOpeningHours(groupByConsecutiveDays(openingHours));

export const sortTimeSpans = (
  timeSpans: OpeningHoursTimeSpan[]
): OpeningHoursTimeSpan[] =>
  [...timeSpans].sort((a, b) => {
    return a.start_time ? a.start_time.localeCompare(b.start_time ?? '') : 1;
  });
