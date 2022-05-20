/// <reference types="jest" />

import { ResourceState } from '../../common/lib/types';
import {
  apiDatePeriodToOpeningHours,
  openingHoursToApiDatePeriod,
} from './form-helpers';

const openingHours = [
  {
    weekdays: [1, 2, 3, 4, 5],
    timeSpanGroups: [
      {
        timeSpans: [
          {
            end_time: '16:00',
            full_day: false,
            resource_state: ResourceState.OPEN,
            start_time: '08:00',
          },
          {
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
        timeSpans: [
          {
            end_time: '16:00',
            full_day: false,
            resource_state: ResourceState.OPEN,
            start_time: '10:00',
          },
        ],
      },
      {
        timeSpans: [
          {
            end_time: '',
            full_day: false,
            resource_state: ResourceState.CLOSED,
            start_time: '',
          },
        ],
      },
    ],
  },
  {
    weekdays: [7],
    timeSpanGroups: [
      {
        timeSpans: [
          {
            end_time: '',
            full_day: false,
            resource_state: ResourceState.OPEN,
            start_time: '',
          },
        ],
      },
    ],
  },
];

const datePeriod = {
  description: { en: '', fi: '', sv: '' },
  end_date: null,
  name: { en: '', fi: 'Normaali aukiolo', sv: '' },
  override: false,
  resource: 8414,
  start_date: null,
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
      ],
    },
    {
      rules: [],
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
    {
      rules: [],
      time_spans: [
        {
          end_time: '',
          full_day: false,
          resource_state: ResourceState.CLOSED,
          start_time: '',
          weekdays: [6],
        },
      ],
    },
    {
      rules: [],
      time_spans: [
        {
          end_time: '',
          full_day: false,
          resource_state: ResourceState.OPEN,
          start_time: '',
          weekdays: [7],
        },
      ],
    },
  ],
};

describe('form-helpers', () => {
  describe('openingHoursToApiDatePeriod', () => {
    it('should map to correct data', () => {
      expect(openingHoursToApiDatePeriod(8414, openingHours)).toEqual(
        datePeriod
      );
    });
  });

  describe('apiDatePeriodToOpeningHours', () => {
    it('should map to correct data', () => {
      expect(apiDatePeriodToOpeningHours(datePeriod)).toEqual(openingHours);
    });
  });
});
