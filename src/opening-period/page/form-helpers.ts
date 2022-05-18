import { DatePeriod, TimeSpan, TimeSpanGroup } from '../../common/lib/types';
import { OpeningHours, OpeningHoursTimeSpan } from './types';

const toTimeSpan = (days: number[]) => (
  timeSpan: OpeningHoursTimeSpan
): TimeSpan => ({
  end_time: timeSpan.end_time,
  full_day: timeSpan.full_day,
  resource_state: timeSpan.resource_state,
  start_time: timeSpan.start_time,
  weekdays: days,
});

const toTimeSpanGroup = (openingHours: OpeningHours[]): TimeSpanGroup => ({
  rules: [],
  time_spans: openingHours.reduce(
    (acc: TimeSpan[], openingHour: OpeningHours) => [
      ...acc,
      ...openingHour.timeSpans.map(toTimeSpan(openingHour.weekdays)),
    ],
    []
  ),
});

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
  time_span_groups: [toTimeSpanGroup(openingHours)],
});
