import { isEqual } from 'lodash';
import { updateByWithDefault } from '../utils/fp/list';
import { byWeekdays } from './opening-hours-helpers';
import {
  OpeningHours,
  OpeningHoursTimeSpan,
  PreviewOpeningHours,
  PreviewRow,
  Rule,
} from '../../opening-period/v2/types';

const ruleOrder: Rule[] = ['week_every', 'week_even', 'week_odd'];

const byRule = (a: PreviewRow, b: PreviewRow): number =>
  ruleOrder.indexOf(a.rule) - ruleOrder.indexOf(b.rule);

const byStartTime = (
  a: OpeningHoursTimeSpan,
  b: OpeningHoursTimeSpan
): number =>
  a.start_time ? a.start_time.localeCompare(b.start_time ?? '') : 1;

const openingHoursRangeEqual = (
  o1: PreviewOpeningHours,
  o2: PreviewOpeningHours
): boolean =>
  o1.timeSpans?.length === o2.timeSpans?.length &&
  (o1.timeSpans || []).every((timeSpan1) =>
    o2.timeSpans?.find((timeSpan2) => isEqual(timeSpan1, timeSpan2))
  );

const areConsecutiveDays = (
  openingHour1: PreviewOpeningHours,
  openingHour2: PreviewOpeningHours
): boolean =>
  openingHour2.weekdays.sort((a, b) => a - b)[0] -
    openingHour1.weekdays.sort((a, b) => a - b)[0] ===
  1;

const groupByConsecutiveDays = (
  openingHours: PreviewOpeningHours[]
): PreviewOpeningHours[] => {
  const individualDays: PreviewOpeningHours[] = [];
  openingHours.sort(byWeekdays).forEach((openingHour) => {
    openingHour.weekdays.forEach((day) => {
      individualDays.push({ ...openingHour, weekdays: [day] });
    });
  });

  const groups: PreviewOpeningHours[][] = [[]];
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

  return groups
    .reduce(
      (result, group) => [
        ...result,
        group.reduce((newOpeningHour: PreviewOpeningHours, openingHour) => {
          return {
            ...openingHour,
            weekdays: [...newOpeningHour.weekdays, ...openingHour.weekdays],
          };
        }),
      ],
      []
    )
    .map((openingHour: PreviewOpeningHours) => ({
      ...openingHour,
      timeSpans: openingHour.timeSpans.sort(byStartTime),
    }))
    .sort(byWeekdays);
};

// eslint-disable-next-line import/prefer-default-export
export const openingHoursToPreviewRows = (
  openingHours: OpeningHours[]
): PreviewRow[] =>
  openingHours
    .reduce(
      (allPreviewRows: PreviewRow[], openingHour) =>
        openingHour.timeSpanGroups.reduce(
          (timeSpanGroupPreviewRows: PreviewRow[], timeSpanGroup) =>
            updateByWithDefault(
              (previewRow) => previewRow.rule === timeSpanGroup.rule,
              (previewRow) => ({
                ...previewRow,
                openingHours: [
                  ...previewRow.openingHours,
                  {
                    timeSpans: timeSpanGroup.timeSpans,
                    weekdays: openingHour.weekdays,
                  },
                ],
              }),
              {
                rule: timeSpanGroup.rule,
                openingHours: [
                  {
                    timeSpans: timeSpanGroup.timeSpans,
                    weekdays: openingHour.weekdays,
                  },
                ],
              },
              timeSpanGroupPreviewRows
            ),
          allPreviewRows
        ),
      []
    )
    // Merge rows with 'Joka viikko' days
    .map((previewRow, idx, arr) => {
      if (previewRow.rule === 'week_every') {
        return previewRow;
      }
      return {
        ...previewRow,
        openingHours: [
          ...previewRow.openingHours,
          ...(arr.find((elem) => elem.rule === 'week_every')?.openingHours ??
            []),
        ],
      };
    })
    // Group consecutive days
    .map((previewRow) => ({
      ...previewRow,
      openingHours: groupByConsecutiveDays(previewRow.openingHours),
    }))
    // If user has selected some other rule than 'Joka viikko' it will be removed from the list
    .filter((previewRow, idx, arr) => {
      if (arr.length > 1 && previewRow.rule === 'week_every') {
        return false;
      }
      return true;
    })
    .sort(byRule);
