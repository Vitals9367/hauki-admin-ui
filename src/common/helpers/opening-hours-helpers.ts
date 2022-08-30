import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import {
  ApiDatePeriod,
  GroupRule,
  Holiday,
  OpeningHours,
  DatePeriod,
  TimeSpan,
  TimeSpanGroup,
  ResourceState,
  Rule,
  ApiTimeSpan,
  ApiTimeSpanGroup,
  Weekdays,
} from '../lib/types';
import {
  formatDate,
  transformDateToApiFormat,
} from '../utils/date-time/format';
import { updateOrAdd } from '../utils/fp/list';

export const byWeekdays = (
  openingHours1: { weekdays: number[] },
  openingHours2: { weekdays: number[] }
): number => {
  const day1 = [...openingHours1.weekdays].sort((a, b) => a - b)[0];
  const day2 = [...openingHours2.weekdays].sort((a, b) => a - b)[0];

  return day1 - day2;
};

const toApiTimeSpan = (days: number[]) => (
  timeSpan: TimeSpan
): ApiTimeSpan => ({
  id: timeSpan.id,
  description: timeSpan.description,
  end_time: timeSpan.end_time,
  full_day: timeSpan.full_day,
  resource_state: timeSpan.resource_state,
  start_time: timeSpan.start_time,
  weekdays: days,
  end_time_on_next_day:
    (timeSpan.start_time &&
      timeSpan.end_time &&
      timeSpan.start_time > timeSpan.end_time) ||
    false,
});

const frequencyModifierMap: { [key in Rule]: string } = {
  week_every: 'every',
  week_even: 'even',
  week_odd: 'odd',
};

const ruleToApiRule = (rule: Rule): GroupRule => ({
  context: 'year',
  subject: 'week',
  frequency_ordinal: null,
  frequency_modifier: frequencyModifierMap[rule],
});

const toApiTimeSpanGroups = (
  openingHours: OpeningHours[]
): ApiTimeSpanGroup[] =>
  openingHours.reduce(
    (result: ApiTimeSpanGroup[], openingHour: OpeningHours) =>
      openingHour.timeSpanGroups.reduce(
        (
          apiTimeSpanGroups: ApiTimeSpanGroup[],
          uiTimeSpanGroup: TimeSpanGroup
        ) =>
          updateOrAdd(
            (apiTimeSpanGroup) =>
              (apiTimeSpanGroup.rules.length === 0 &&
                uiTimeSpanGroup.rule === 'week_every') ||
              apiTimeSpanGroup.rules[0]?.frequency_modifier ===
                ruleToApiRule(uiTimeSpanGroup.rule).frequency_modifier,
            (apiTimeSpanGroup) => ({
              ...apiTimeSpanGroup,
              time_spans: [
                ...apiTimeSpanGroup.time_spans,
                ...uiTimeSpanGroup.timeSpans.map(
                  toApiTimeSpan(openingHour.weekdays)
                ),
              ],
            }),
            {
              id: uiTimeSpanGroup.id,
              rules:
                uiTimeSpanGroup.rule === 'week_every'
                  ? []
                  : [ruleToApiRule(uiTimeSpanGroup.rule)],
              time_spans: uiTimeSpanGroup.timeSpans.map(
                toApiTimeSpan(openingHour.weekdays)
              ),
            },
            apiTimeSpanGroups
          ),
        result
      ),
    []
  );

export const datePeriodToApiDatePeriod = (
  resource: number,
  datePeriod: DatePeriod
): ApiDatePeriod => ({
  name: datePeriod.name,
  end_date:
    datePeriod.fixed && datePeriod.endDate
      ? transformDateToApiFormat(datePeriod.endDate)
      : null,
  id: datePeriod.id,
  description: {
    en: null,
    fi: null,
    sv: null,
  },
  override: false,
  resource,
  start_date: datePeriod.startDate
    ? transformDateToApiFormat(datePeriod.startDate)
    : null,
  time_span_groups: toApiTimeSpanGroups(datePeriod.openingHours),
  ...(datePeriod.resourceState
    ? { resource_state: datePeriod.resourceState }
    : {}),
});

const weekDaysMatch = (weekdays1: Weekdays, weekdays2: Weekdays): boolean =>
  weekdays1.every((weekday) => weekdays2.includes(weekday));

export const apiTimeSpanToTimeSpan = (timeSpan: ApiTimeSpan): TimeSpan => ({
  id: timeSpan.id,
  description: timeSpan.description,
  end_time: timeSpan.end_time ? timeSpan.end_time.substring(0, 5) : null,
  full_day:
    timeSpan.resource_state === ResourceState.CLOSED
      ? false
      : timeSpan.full_day,
  resource_state: timeSpan.resource_state,
  start_time: timeSpan.start_time ? timeSpan.start_time.substring(0, 5) : null,
});

const apiRulesToRule = (apiRules: GroupRule[]): Rule => {
  const apiRule = apiRules[0];
  if (apiRule && apiRule.context === 'year' && apiRule.subject === 'week') {
    switch (apiRule.frequency_modifier) {
      case 'even':
        return 'week_even';
      case 'odd':
        return 'week_odd';
      default:
        console.error(
          `Invalid frequency modifier ${apiRule.frequency_modifier}. Defaulting to every week`
        );
        return 'week_every';
    }
  }

  if (apiRule) {
    console.error(
      `Invalid api rule ${JSON.stringify(apiRule)}. Defaulting to every week`
    );
  }
  return 'week_every';
};

const apiTimeSpanGroupsToOpeningHours = (
  timeSpanGroups: ApiTimeSpanGroup[]
): OpeningHours[] =>
  // Go through time span groups to start mapping them to opening hours. We have to go deep to the time span level.
  timeSpanGroups
    .reduce(
      (
        allOpeningHours: OpeningHours[],
        { id, rules, time_spans: timeSpans }: ApiTimeSpanGroup
      ) =>
        // Go thru time spans in time span group to find matching weekdays
        timeSpans.reduce(
          (openingHours, timeSpan) =>
            updateOrAdd(
              // Match  openings hours with same weekdays
              (openingHour) =>
                weekDaysMatch(openingHour.weekdays, timeSpan.weekdays ?? []),
              // If opening hours are found go thru opening hour's time span groups
              (openingHour) => ({
                ...openingHour,
                timeSpanGroups: updateOrAdd(
                  // Match time span groups with same rule
                  (timeSpanGroup) => {
                    return apiRulesToRule(rules) === timeSpanGroup.rule;
                  },
                  // Add time span to matching time span group
                  (timeSpanGroup) => ({
                    ...timeSpanGroup,
                    timeSpans: [
                      ...timeSpanGroup.timeSpans,
                      apiTimeSpanToTimeSpan(timeSpan),
                    ],
                  }),
                  // If no matching time span group found add new item to arr.
                  {
                    id,
                    rule: apiRulesToRule(rules),
                    timeSpans: [apiTimeSpanToTimeSpan(timeSpan)],
                  },
                  openingHour.timeSpanGroups
                ),
              }),
              // If no matching opening hours is found add new item to arr.
              {
                weekdays: timeSpan.weekdays ?? [],
                timeSpanGroups: [
                  {
                    id,
                    rule: apiRulesToRule(rules),
                    timeSpans: [apiTimeSpanToTimeSpan(timeSpan)],
                  },
                ],
              },
              openingHours
            ),
          allOpeningHours
        ),
      []
    )
    .sort(byWeekdays);

export const apiDatePeriodToDatePeriod = (
  datePeriod: ApiDatePeriod
): DatePeriod => ({
  name: datePeriod.name,
  endDate: datePeriod.end_date ? formatDate(datePeriod.end_date) : null,
  fixed:
    (!!datePeriod.start_date && !!datePeriod.end_date) || !!datePeriod.end_date,
  startDate: datePeriod.start_date ? formatDate(datePeriod.start_date) : null,
  openingHours: apiTimeSpanGroupsToOpeningHours(datePeriod.time_span_groups),
  id: datePeriod.id,
  resourceState: datePeriod.resource_state,
  override: datePeriod.override,
});

const isWithinRange = (date: string, datePeriod: DatePeriod): boolean =>
  (datePeriod.startDate == null ||
    transformDateToApiFormat(datePeriod.startDate) <= date) &&
  (datePeriod.endDate == null ||
    transformDateToApiFormat(datePeriod.endDate) >= date);

const toTimeWithDefault = (
  uiDate: string | null,
  defaultUiDate: string
): number =>
  new Date(transformDateToApiFormat(uiDate ?? defaultUiDate)).getTime();

const getTimeRange = (datePeriod: DatePeriod) =>
  toTimeWithDefault(datePeriod.endDate, '31.12.2045') -
  toTimeWithDefault(datePeriod.startDate, '01.01.1975');

const dateRangeIsShorter = (
  other: DatePeriod,
  datePeriod: DatePeriod
): boolean => getTimeRange(datePeriod) < getTimeRange(other);

export const getActiveDatePeriod = (
  date: string,
  dates: DatePeriod[]
): DatePeriod | undefined => {
  return dates.reduce((acc: DatePeriod | undefined, current: DatePeriod) => {
    if (
      isWithinRange(date, current) &&
      (!acc || dateRangeIsShorter(acc, current))
    ) {
      return current;
    }

    return acc;
  }, undefined);
};

const dayInMilliseconds = 24 * 60 * 60 * 1000;

export const isHoliday = (
  datePeriod: DatePeriod,
  holidays: Holiday[]
): boolean =>
  !!datePeriod.endDate &&
  !!datePeriod.startDate &&
  !!datePeriod.override &&
  !!holidays.find(
    (holiday) =>
      !!datePeriod.endDate &&
      holiday.date === transformDateToApiFormat(datePeriod.endDate) &&
      holiday.name === datePeriod.name.fi
  ) &&
  differenceInMilliseconds(
    new Date(transformDateToApiFormat(datePeriod.endDate)),
    new Date(transformDateToApiFormat(datePeriod.startDate))
  ) <= dayInMilliseconds;
