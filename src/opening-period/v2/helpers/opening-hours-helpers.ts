import {
  DatePeriod,
  TimeSpan,
  TimeSpanGroup,
  Weekdays,
} from '../../../common/lib/types';
import {
  OpeningHours,
  OpeningHoursTimeSpan,
  OpeningHoursTimeSpanGroup,
} from '../types';

function update<T>(
  predicate: (data: T) => boolean,
  fn: (data: T) => Partial<T>,
  arr: T[]
): T[] {
  let found = false;
  const result = arr.map((elem) => {
    if (predicate(elem)) {
      found = true;
      return {
        ...elem,
        ...fn(elem),
      };
    }

    return elem;
  });

  if (!found) {
    return arr;
  }

  return result;
}

function updateOr<T>(
  predicate: (data: T) => boolean,
  fn: (data: T) => Partial<T>,
  defaultValues: T,
  arr: T[]
): T[] {
  const result = update(predicate, fn, arr);

  if (result === arr) {
    return [...arr, defaultValues];
  }

  return result;
}

export const sortOpeningHours = (
  openingHours: OpeningHours[]
): OpeningHours[] =>
  [...openingHours].sort((a, b) => {
    const day1 = a.weekdays.sort()[0];
    const day2 = b.weekdays.sort()[0];

    return day1 - day2;
  });

const toTimeSpan = (days: number[]) => (
  timeSpan: OpeningHoursTimeSpan
): TimeSpan => ({
  end_time: timeSpan.end_time || null,
  full_day: timeSpan.full_day,
  resource_state: timeSpan.resource_state,
  start_time: timeSpan.start_time || null,
  weekdays: days,
});

const toTimeSpanGroups = (openingHours: OpeningHours[]): TimeSpanGroup[] =>
  openingHours.reduce(
    (result: TimeSpanGroup[], openingHour: OpeningHours) =>
      openingHour.timeSpanGroups.reduce(
        (
          apiTimeSpanGroups: TimeSpanGroup[],
          uitTimeSpanGroup: OpeningHoursTimeSpanGroup
        ) =>
          updateOr(
            // TODO: Add proper predicate when the rules are mapped correctly
            () => true,
            (apiTimeSpanGroup) => ({
              time_spans: [
                ...apiTimeSpanGroup.time_spans,
                ...uitTimeSpanGroup.timeSpans.map(
                  toTimeSpan(openingHour.weekdays)
                ),
              ],
            }),
            {
              rules: [], // TODO: Map rules
              time_spans: uitTimeSpanGroup.timeSpans.map(
                toTimeSpan(openingHour.weekdays)
              ),
            },
            apiTimeSpanGroups
          ),
        result
      ),
    []
  );

// eslint-disable-next-line import/prefer-default-export
export const openingHoursToApiDatePeriod = (
  resource: number,
  openingHours: OpeningHours[],
  id?: number
): DatePeriod => ({
  description: {
    en: '',
    fi: '',
    sv: '',
  },
  end_date: null,
  id,
  name: {
    en: '',
    fi: 'Normaali aukiolo',
    sv: '',
  },
  override: false,
  resource,
  start_date: null,
  time_span_groups: toTimeSpanGroups(openingHours),
});

const weekDaysMatch = (weekdays1: Weekdays, weekdays2: Weekdays): boolean =>
  weekdays1.every((weekday) => weekdays2.includes(weekday));

const apiTimeSpanToTimeSpan = (timeSpan: TimeSpan): OpeningHoursTimeSpan => ({
  description: timeSpan.description,
  end_time: timeSpan.end_time ? timeSpan.end_time.substring(0, 5) : null,
  full_day: timeSpan.full_day,
  resource_state: timeSpan.resource_state,
  start_time: timeSpan.start_time ? timeSpan.start_time.substring(0, 5) : null,
});

export const apiDatePeriodToOpeningHours = (
  datePeriod: DatePeriod
): OpeningHours[] =>
  datePeriod.time_span_groups.reduce(
    // eslint-disable-next-line @typescript-eslint/naming-convention
    (result: OpeningHours[], { time_spans }: TimeSpanGroup) =>
      time_spans.reduce(
        (openingHours, timeSpan) =>
          updateOr(
            (openingHour) =>
              weekDaysMatch(openingHour.weekdays, timeSpan.weekdays ?? []),
            (openingHour) => ({
              timeSpanGroups: update(
                // TODO: Add proper predicate when the rules are mapped correctly
                () => true,
                (timeSpanGroup) => ({
                  timeSpans: [
                    ...timeSpanGroup.timeSpans,
                    apiTimeSpanToTimeSpan(timeSpan),
                  ],
                }),
                openingHour.timeSpanGroups
              ),
            }),
            {
              weekdays: timeSpan.weekdays ?? [],
              timeSpanGroups: [
                { timeSpans: [apiTimeSpanToTimeSpan(timeSpan)] },
              ],
            },
            openingHours
          ),
        result
      ),
    []
  );
