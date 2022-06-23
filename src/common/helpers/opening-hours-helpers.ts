import {
  DatePeriod,
  GroupRule,
  ResourceState,
  TimeSpan,
  TimeSpanGroup,
  Weekdays,
  OpeningHours,
  OpeningHoursFormValues,
  OpeningHoursTimeSpan,
  OpeningHoursTimeSpanGroup,
  Rule,
} from '../lib/types';
import {
  formatDate,
  transformDateToApiFormat,
} from '../utils/date-time/format';
import { updateByWithDefault } from '../utils/fp/list';

export const byWeekdays = (
  openingHours1: { weekdays: number[] },
  openingHours2: { weekdays: number[] }
): number => {
  const day1 = openingHours1.weekdays.sort((a, b) => a - b)[0];
  const day2 = openingHours2.weekdays.sort((a, b) => a - b)[0];

  return day1 - day2;
};

const toTimeSpan = (days: number[]) => (
  timeSpan: OpeningHoursTimeSpan
): TimeSpan => ({
  description:
    timeSpan.resource_state === ResourceState.OTHER
      ? timeSpan.description
      : { fi: null, sv: null, en: null },
  end_time:
    (timeSpan.resource_state !== ResourceState.CLOSED &&
      timeSpan.start_time &&
      timeSpan.end_time) ||
    null,
  full_day:
    timeSpan.resource_state === ResourceState.CLOSED ? true : timeSpan.full_day,
  resource_state:
    timeSpan.resource_state === ResourceState.OTHER
      ? ResourceState.OPEN
      : timeSpan.resource_state,
  start_time:
    (timeSpan.resource_state !== ResourceState.CLOSED && timeSpan.start_time) ||
    null,
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

const toTimeSpanGroups = (openingHours: OpeningHours[]): TimeSpanGroup[] =>
  openingHours.reduce(
    (result: TimeSpanGroup[], openingHour: OpeningHours) =>
      openingHour.timeSpanGroups.reduce(
        (
          apiTimeSpanGroups: TimeSpanGroup[],
          uiTimeSpanGroup: OpeningHoursTimeSpanGroup
        ) =>
          updateByWithDefault(
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
                  toTimeSpan(openingHour.weekdays)
                ),
              ],
            }),
            {
              rules:
                uiTimeSpanGroup.rule === 'week_every'
                  ? []
                  : [ruleToApiRule(uiTimeSpanGroup.rule)],
              time_spans: uiTimeSpanGroup.timeSpans.map(
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
export const formValuesToApiDatePeriod = (
  resource: number,
  formValues: OpeningHoursFormValues,
  id?: number
): DatePeriod => ({
  name: formValues.name,
  end_date:
    formValues.fixed && formValues.endDate
      ? transformDateToApiFormat(formValues.endDate)
      : null,
  id,
  description: {
    en: null,
    fi: null,
    sv: null,
  },
  override: false,
  resource,
  start_date: formValues.startDate
    ? transformDateToApiFormat(formValues.startDate)
    : null,
  time_span_groups: toTimeSpanGroups(formValues.openingHours),
});

const weekDaysMatch = (weekdays1: Weekdays, weekdays2: Weekdays): boolean =>
  weekdays1.every((weekday) => weekdays2.includes(weekday));

const resourceStateIsOther = (timeSpan: TimeSpan): boolean =>
  !!timeSpan.description.fi ||
  !!timeSpan.description.sv ||
  !!timeSpan.description.en;

const apiTimeSpanToTimeSpan = (timeSpan: TimeSpan): OpeningHoursTimeSpan => ({
  description: timeSpan.description,
  end_time: timeSpan.end_time ? timeSpan.end_time.substring(0, 5) : null,
  full_day:
    timeSpan.resource_state === ResourceState.CLOSED
      ? false
      : timeSpan.full_day,
  resource_state: resourceStateIsOther(timeSpan)
    ? ResourceState.OTHER
    : timeSpan.resource_state,
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

export const apiDatePeriodToOpeningHours = (
  datePeriod: DatePeriod
): OpeningHours[] =>
  datePeriod.time_span_groups
    .reduce(
      // eslint-disable-next-line @typescript-eslint/naming-convention
      (allOpeningHours: OpeningHours[], { rules, time_spans }: TimeSpanGroup) =>
        time_spans.reduce(
          (timeSpanOpeningHours, timeSpan) =>
            updateByWithDefault(
              (openingHour) =>
                weekDaysMatch(openingHour.weekdays, timeSpan.weekdays ?? []),
              (openingHour) => ({
                ...openingHour,
                timeSpanGroups: updateByWithDefault(
                  (timeSpanGroup) => {
                    return apiRulesToRule(rules) === timeSpanGroup.rule;
                  },
                  (timeSpanGroup) => ({
                    ...timeSpanGroup,
                    timeSpans: [
                      ...timeSpanGroup.timeSpans,
                      apiTimeSpanToTimeSpan(timeSpan),
                    ],
                  }),
                  {
                    rule: apiRulesToRule(rules),
                    timeSpans: [apiTimeSpanToTimeSpan(timeSpan)],
                  },
                  openingHour.timeSpanGroups
                ),
              }),
              {
                weekdays: timeSpan.weekdays ?? [],
                timeSpanGroups: [
                  {
                    rule: apiRulesToRule(rules),
                    timeSpans: [apiTimeSpanToTimeSpan(timeSpan)],
                  },
                ],
              },
              timeSpanOpeningHours
            ),
          allOpeningHours
        ),
      []
    )
    .sort(byWeekdays);

export const apiDatePeriodToFormValues = (
  datePeriod: DatePeriod
): OpeningHoursFormValues => ({
  name: datePeriod.name,
  endDate: datePeriod.end_date ? formatDate(datePeriod.end_date) : null,
  fixed:
    (!!datePeriod.start_date && !!datePeriod.end_date) || !!datePeriod.end_date,
  startDate: datePeriod.start_date ? formatDate(datePeriod.start_date) : null,
  openingHours: apiDatePeriodToOpeningHours(datePeriod),
});

const isWithinRange = (date: string, datePeriod: DatePeriod): boolean =>
  (datePeriod.start_date == null || datePeriod.start_date) <= date &&
  (datePeriod.end_date === null || datePeriod.end_date >= date);

const dateRangeIsShorter = (
  other: DatePeriod,
  datePeriod: DatePeriod
): boolean =>
  new Date(datePeriod.end_date ?? '2045-01-01').getTime() -
    new Date(datePeriod.start_date ?? '1975-01-01').getTime() <
  new Date(other.end_date ?? '2045-01-01').getTime() -
    new Date(other.start_date ?? '1975-01-01').getTime();

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
