import { omit } from 'lodash/fp';
import {
  DatePeriod,
  TimeSpan,
  TimeSpanGroup,
  Weekdays,
} from '../../common/lib/types';
import {
  OpeningHours,
  OpeningHoursTimeSpan,
  OpeningHoursTimeSpanGroup,
} from './types';

const toTimeSpan = (days: number[]) => (
  timeSpan: OpeningHoursTimeSpan
): TimeSpan => ({
  end_time: timeSpan.end_time || null,
  full_day: timeSpan.full_day,
  resource_state: timeSpan.resource_state,
  start_time: timeSpan.start_time || null,
  weekdays: days,
});

const toTimeSpanGroup = (openingHours: OpeningHours[]): TimeSpanGroup[] =>
  openingHours.reduce(
    (allTimeSpanGroups: TimeSpanGroup[], openingHour: OpeningHours) => [
      ...allTimeSpanGroups,
      ...openingHour.timeSpanGroups.reduce(
        (
          timeSpanGroups: TimeSpanGroup[],
          timeSpanGroup: OpeningHoursTimeSpanGroup
        ) => [
          ...timeSpanGroups,
          {
            rules: [], // TODO: Map rules
            time_spans: timeSpanGroup.timeSpans.map(
              toTimeSpan(openingHour.weekdays)
            ),
          },
        ],
        []
      ),
    ],
    []
  );

// eslint-disable-next-line import/prefer-default-export
export const openingHoursToApiDatePeriod = (
  resource: number,
  openingHours: OpeningHours[]
): DatePeriod => ({
  description: {
    en: '',
    fi: '',
    sv: '',
  },
  end_date: null,
  name: {
    en: '',
    fi: 'Normaali aukiolo',
    sv: '',
  },
  override: false,
  resource,
  start_date: null,
  time_span_groups: toTimeSpanGroup(openingHours),
});

const weekDaysMatch = (weekdays1: Weekdays, weekdays2: Weekdays): boolean =>
  weekdays1.every((weekday) => weekdays2.includes(weekday));

const apiTimeSpanToTimeSpan: (
  timeSpan: TimeSpan
) => OpeningHoursTimeSpan = omit(['weekdays']);

const apiTimeSpanGroupToTimeSpanGroup = (
  apiTimeSpanGroup: TimeSpanGroup
): OpeningHoursTimeSpanGroup => ({
  timeSpans: apiTimeSpanGroup.time_spans.map(apiTimeSpanToTimeSpan),
});

export const apiDatePeriodToOpeningHours = (
  datePeriod: DatePeriod
): OpeningHours[] =>
  datePeriod.time_span_groups.reduce(
    (openingHours: OpeningHours[], timeSpanGroup: TimeSpanGroup) => {
      const found = openingHours.find((openingHour) => {
        return weekDaysMatch(
          openingHour.weekdays,
          timeSpanGroup.time_spans[0].weekdays ?? []
        );
      });

      if (found) {
        return openingHours.map((openingHour) => {
          if (openingHour === found) {
            return {
              ...openingHour,
              timeSpanGroups: [
                ...openingHour.timeSpanGroups,
                apiTimeSpanGroupToTimeSpanGroup(timeSpanGroup),
              ],
            };
          }
          return openingHour;
        });
      }

      return [
        ...openingHours,
        {
          weekdays: timeSpanGroup.time_spans[0].weekdays ?? [],
          timeSpanGroups: [apiTimeSpanGroupToTimeSpanGroup(timeSpanGroup)],
        },
      ];
    },
    []
  );
