/// <reference types="jest" />

import { ResourceState } from '../../../common/lib/types';
import {
  apiDatePeriodToOpeningHours,
  openingHoursToApiDatePeriod,
} from './opening-hours-helpers';

const openingHours = [
  {
    weekdays: [1, 2, 3, 4, 5],
    timeSpanGroups: [
      {
        rule: 'week_every' as const,
        timeSpans: [
          {
            description: undefined,
            end_time: '16:00',
            full_day: false,
            resource_state: ResourceState.OPEN,
            start_time: '08:00',
          },
          {
            description: undefined,
            end_time: '17:00',
            full_day: false,
            resource_state: ResourceState.SELF_SERVICE,
            start_time: '16:00',
          },
        ],
      },
    ],
  },
  {
    weekdays: [6],
    timeSpanGroups: [
      {
        rule: 'week_even' as const,
        timeSpans: [
          {
            description: undefined,
            end_time: '16:00',
            full_day: false,
            resource_state: ResourceState.OPEN,
            start_time: '10:00',
          },
          {
            description: undefined,
            end_time: '16:00',
            full_day: false,
            resource_state: ResourceState.CLOSED,
            start_time: '17:00',
          },
        ],
      },
      {
        rule: 'week_odd' as const,
        timeSpans: [
          {
            description: undefined,
            end_time: '16:00',
            full_day: false,
            resource_state: ResourceState.OPEN,
            start_time: '10:00',
          },
        ],
      },
    ],
  },
  {
    weekdays: [7],
    timeSpanGroups: [
      {
        rule: 'week_every' as const,
        timeSpans: [
          {
            description: undefined,
            end_time: null,
            full_day: false,
            resource_state: ResourceState.OPEN,
            start_time: null,
          },
        ],
      },
    ],
  },
];

const datePeriod = {
  id: undefined,
  description: { en: null, fi: 'Otsikko', sv: null },
  end_date: null,
  name: { en: '', fi: 'Normaali aukiolo', sv: '' },
  override: false,
  resource: 8414,
  start_date: '2022-06-06',
  time_span_groups: [
    {
      rules: [],
      time_spans: [
        {
          end_time: '16:00',
          full_day: false,
          resource_state: ResourceState.OPEN,
          start_time: '08:00',
          weekdays: [1, 2, 3, 4, 5],
        },
        {
          end_time: '17:00',
          full_day: false,
          resource_state: ResourceState.SELF_SERVICE,
          start_time: '16:00',
          weekdays: [1, 2, 3, 4, 5],
        },
        {
          end_time: null,
          full_day: false,
          resource_state: ResourceState.OPEN,
          start_time: null,
          weekdays: [7],
        },
      ],
    },
    {
      rules: [
        {
          context: 'year',
          subject: 'week',
          frequency_modifier: 'even',
          frequency_ordinal: null,
        },
      ],
      time_spans: [
        {
          end_time: '16:00',
          full_day: false,
          resource_state: ResourceState.OPEN,
          start_time: '10:00',
          weekdays: [6],
        },
        {
          end_time: '16:00',
          full_day: false,
          resource_state: ResourceState.CLOSED,
          start_time: '17:00',
          weekdays: [6],
        },
      ],
    },
    {
      rules: [
        {
          context: 'year',
          subject: 'week',
          frequency_modifier: 'odd',
          frequency_ordinal: null,
        },
      ],
      time_spans: [
        {
          end_time: '16:00',
          full_day: false,
          resource_state: ResourceState.OPEN,
          start_time: '10:00',
          weekdays: [6],
        },
      ],
    },
  ],
};

describe('form-helpers', () => {
  describe('openingHoursToApiDatePeriod', () => {
    it('should map to correct data', () => {
      expect(
        openingHoursToApiDatePeriod(
          8414,
          { fi: 'Otsikko', sv: null, en: null },
          '6.6.2022',
          openingHours
        )
      ).toEqual(datePeriod);
    });
  });

  describe('apiDatePeriodToOpeningHours', () => {
    it('should map to correct data', () => {
      expect(apiDatePeriodToOpeningHours(datePeriod)).toEqual(openingHours);
    });
  });
});
