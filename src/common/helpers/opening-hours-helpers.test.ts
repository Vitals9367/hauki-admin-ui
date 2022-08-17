/// <reference types="jest" />

import { DatePeriod, ResourceState } from '../lib/types';
import {
  apiDatePeriodToDatePeriod,
  datePeriodToApiDatePeriod,
  getActiveDatePeriod,
  isHoliday,
} from './opening-hours-helpers';

const openingHours = [
  {
    weekdays: [1, 2, 3, 4, 5],
    timeSpanGroups: [
      {
        rule: 'week_every' as const,
        timeSpans: [
          {
            id: undefined,
            description: { en: null, fi: null, sv: null },
            end_time: '16:00',
            full_day: false,
            resource_state: ResourceState.OPEN,
            start_time: '08:00',
          },
          {
            id: undefined,
            description: { en: null, fi: null, sv: null },
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
            id: undefined,
            description: { en: null, fi: null, sv: null },
            end_time: '16:00',
            full_day: false,
            resource_state: ResourceState.OPEN,
            start_time: '10:00',
          },
          {
            id: undefined,
            description: { en: null, fi: null, sv: null },
            end_time: null,
            full_day: false,
            resource_state: ResourceState.CLOSED,
            start_time: null,
          },
        ],
      },
      {
        rule: 'week_odd' as const,
        timeSpans: [
          {
            id: undefined,
            description: { en: null, fi: null, sv: null },
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
            id: undefined,
            description: { en: null, fi: null, sv: null },
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

const datePeriod: DatePeriod = {
  name: { en: null, fi: 'Normaali aukiolo', sv: null },
  endDate: '31.12.2022',
  fixed: true,
  startDate: '06.06.2022',
  openingHours: [
    {
      weekdays: [1, 2, 3, 4, 5],
      timeSpanGroups: [
        {
          rule: 'week_every',
          timeSpans: [
            {
              description: { en: null, fi: null, sv: null },
              end_time: '16:00',
              full_day: false,
              resource_state: ResourceState.OPEN,
              start_time: '08:00',
            },
            {
              description: { en: null, fi: null, sv: null },
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
          rule: 'week_even',
          timeSpans: [
            {
              description: { en: null, fi: null, sv: null },
              end_time: '16:00',
              full_day: false,
              resource_state: ResourceState.OPEN,
              start_time: '10:00',
            },
            {
              description: { en: null, fi: null, sv: null },
              end_time: null,
              full_day: false,
              resource_state: ResourceState.CLOSED,
              start_time: null,
            },
          ],
        },
        {
          rule: 'week_odd',
          timeSpans: [
            {
              description: { en: null, fi: null, sv: null },
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
          rule: 'week_every',
          timeSpans: [
            {
              description: { en: null, fi: null, sv: null },
              end_time: null,
              full_day: false,
              resource_state: ResourceState.OPEN,
              start_time: null,
            },
          ],
        },
      ],
    },
  ],
  override: false,
};

const apiDatePeriod = {
  id: undefined,
  end_date: '2022-12-31',
  name: { en: null, fi: 'Normaali aukiolo', sv: null },
  description: { en: null, fi: null, sv: null },
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
          end_time_on_next_day: false,
          description: { en: null, fi: null, sv: null },
        },
        {
          end_time: '17:00',
          full_day: false,
          resource_state: ResourceState.SELF_SERVICE,
          start_time: '16:00',
          weekdays: [1, 2, 3, 4, 5],
          end_time_on_next_day: false,
          description: { en: null, fi: null, sv: null },
        },
        {
          end_time: null,
          full_day: false,
          resource_state: ResourceState.OPEN,
          start_time: null,
          weekdays: [7],
          end_time_on_next_day: false,
          description: { en: null, fi: null, sv: null },
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
          end_time_on_next_day: false,
          description: { en: null, fi: null, sv: null },
        },
        {
          end_time_on_next_day: false,
          end_time: null,
          full_day: true,
          resource_state: ResourceState.CLOSED,
          start_time: null,
          weekdays: [6],
          description: { en: null, fi: null, sv: null },
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
          end_time_on_next_day: false,
          description: { en: null, fi: null, sv: null },
        },
      ],
    },
  ],
};

describe('opening-hours-helpers', () => {
  describe('openingHoursToApiDatePeriod', () => {
    it('should map to correct data', () => {
      expect(
        datePeriodToApiDatePeriod(8414, {
          endDate: '31.12.2022',
          fixed: true,
          name: { fi: 'Normaali aukiolo', sv: null, en: null },
          openingHours,
          startDate: '06.06.2022',
        })
      ).toEqual(apiDatePeriod);
    });
  });

  describe('apiDatePeriodToOpeningHours', () => {
    it('should map to correct data', () => {
      expect(apiDatePeriodToDatePeriod(apiDatePeriod)).toEqual({
        endDate: '31.12.2022',
        fixed: true,
        name: { fi: 'Normaali aukiolo', sv: null, en: null },
        openingHours,
        startDate: '06.06.2022',
        id: undefined,
        override: false,
        resourceState: undefined,
      });
    });
  });

  describe('getActiveDatePeriod', () => {
    expect(
      getActiveDatePeriod('2022-06-23', [
        {
          name: { fi: 'Normaaliaukiolo', sv: '', en: '' },
          endDate: '31.12.2022',
          fixed: true,
          startDate: '01.01.2022',
          openingHours: [
            {
              weekdays: [1, 2, 3, 4, 5],
              timeSpanGroups: [
                {
                  rule: 'week_every',
                  timeSpans: [
                    {
                      id: 890209,
                      description: { fi: null, sv: null, en: null },
                      end_time: null,
                      full_day: false,
                      resource_state: ResourceState.OPEN,
                      start_time: null,
                    },
                  ],
                },
              ],
            },
            {
              weekdays: [6, 7],
              timeSpanGroups: [
                {
                  rule: 'week_every',
                  timeSpans: [
                    {
                      id: 890210,
                      description: { fi: null, sv: null, en: null },
                      end_time: null,
                      full_day: false,
                      resource_state: ResourceState.CLOSED,
                      start_time: null,
                    },
                  ],
                },
              ],
            },
          ],
          id: 1041529,
          resourceState: ResourceState.UNDEFINED,
          override: false,
        },
        {
          name: { fi: 'Kesäkuun aukiolot', sv: '', en: '' },
          endDate: '30.06.2022',
          fixed: true,
          startDate: '01.06.2022',
          openingHours: [
            {
              weekdays: [1, 2, 3, 4, 5],
              timeSpanGroups: [
                {
                  rule: 'week_every',
                  timeSpans: [
                    {
                      id: 890207,
                      description: { fi: null, sv: null, en: null },
                      end_time: '15:00',
                      full_day: false,
                      resource_state: ResourceState.OPEN,
                      start_time: '10:00',
                    },
                  ],
                },
              ],
            },
            {
              weekdays: [6, 7],
              timeSpanGroups: [
                {
                  rule: 'week_every',
                  timeSpans: [
                    {
                      id: 890208,
                      description: { fi: null, sv: null, en: null },
                      end_time: null,
                      full_day: false,
                      resource_state: ResourceState.CLOSED,
                      start_time: null,
                    },
                  ],
                },
              ],
            },
          ],
          id: 1039083,
          resourceState: ResourceState.UNDEFINED,
          override: false,
        },
        {
          name: { fi: 'Juhannus', sv: '', en: '' },
          endDate: '26.06.2022',
          fixed: true,
          startDate: '24.06.2022',
          openingHours: [
            {
              weekdays: [1, 2, 3, 4, 5],
              timeSpanGroups: [
                {
                  rule: 'week_every',
                  timeSpans: [
                    {
                      id: 889998,
                      description: { fi: null, sv: null, en: null },
                      end_time: null,
                      full_day: true,
                      resource_state: ResourceState.OPEN,
                      start_time: null,
                    },
                  ],
                },
              ],
            },
            {
              weekdays: [6, 7],
              timeSpanGroups: [
                {
                  rule: 'week_every',
                  timeSpans: [
                    {
                      id: 889999,
                      description: { fi: null, sv: null, en: null },
                      end_time: null,
                      full_day: false,
                      resource_state: ResourceState.CLOSED,
                      start_time: null,
                    },
                  ],
                },
              ],
            },
          ],
          id: 1039084,
          resourceState: ResourceState.UNDEFINED,
          override: false,
        },
        {
          name: { fi: 'Heinäkuun aukiolot', sv: '', en: '' },
          endDate: '31.07.2022',
          fixed: true,
          startDate: '01.07.2022',
          openingHours: [
            {
              weekdays: [1, 2, 3, 4, 5],
              timeSpanGroups: [
                {
                  rule: 'week_every',
                  timeSpans: [
                    {
                      id: 889630,
                      description: { fi: null, sv: null, en: null },
                      end_time: null,
                      full_day: false,
                      resource_state: ResourceState.OPEN,
                      start_time: null,
                    },
                  ],
                },
              ],
            },
            {
              weekdays: [6, 7],
              timeSpanGroups: [
                {
                  rule: 'week_every',
                  timeSpans: [
                    {
                      id: 889631,
                      description: { fi: null, sv: null, en: null },
                      end_time: null,
                      full_day: false,
                      resource_state: ResourceState.CLOSED,
                      start_time: null,
                    },
                  ],
                },
              ],
            },
          ],
          id: 1041197,
          resourceState: ResourceState.UNDEFINED,
          override: false,
        },
      ])?.id
    ).toEqual(1039083);
  });

  describe('isHoliday', () => {
    const holidays = [
      {
        date: '2022-12-31',
        end_date: '2022-12-31',
        name: 'Uudenvuodenaatto',
        start_date: '2022-12-31',
      },
      {
        date: '2023-01-01',
        end_date: '2023-01-01',
        name: 'Uudenvuodenpäivä',
        start_date: '2022-12-31',
      },
    ];

    it('should return true when datePeriod is override and matches with holiday', () => {
      expect(
        isHoliday(
          {
            ...datePeriod,
            startDate: '31.12.2022',
            endDate: '31.12.2022',
            name: { fi: 'Uudenvuodenaatto', sv: '', en: '' },
            override: true,
          },
          holidays
        )
      ).toBe(true);
    });

    it('should return false when datePeriod is override but the range does not match with holiday', () => {
      expect(
        isHoliday(
          {
            ...datePeriod,
            startDate: '25.12.2022',
            endDate: '31.12.2022',
            name: { fi: 'Uudenvuodenaatto', sv: '', en: '' },
            override: true,
          },
          holidays
        )
      ).toBe(false);
    });

    it('should return false when datePeriod is override and name does not match with holiday', () => {
      expect(
        isHoliday(
          {
            ...datePeriod,
            startDate: '31.12.2022',
            endDate: '31.12.2022',
            name: { fi: 'Talvi', sv: '', en: '' },
            override: true,
          },
          holidays
        )
      ).toBe(false);
    });
  });
});
