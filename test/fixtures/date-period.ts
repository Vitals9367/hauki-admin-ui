import { DatePeriod, ResourceState } from '../../src/common/lib/types';

// eslint-disable-next-line import/prefer-default-export
export const datePeriod: DatePeriod = {
  name: { fi: '', sv: '', en: '' },
  endDate: '21.11.2020',
  fixed: true,
  startDate: null,
  openingHours: [
    {
      weekdays: [1, 3],
      timeSpanGroups: [
        {
          rule: { id: undefined, group: 1, type: 'week_every' },
          timeSpans: [
            {
              id: 9054,
              description: { fi: '', sv: null, en: null },
              end_time: '16:00',
              full_day: false,
              resource_state: ResourceState.UNDEFINED,
              start_time: '08:00',
            },
          ],
        },
      ],
    },
    {
      weekdays: [2, 4],
      timeSpanGroups: [
        {
          rule: { id: undefined, group: 1, type: 'week_every' },
          timeSpans: [
            {
              id: 14667,
              description: { fi: 'Auki lyhyemmän ajan', sv: null, en: null },
              end_time: '14:31',
              full_day: false,
              resource_state: ResourceState.OTHER,
              start_time: '10:31',
            },
          ],
        },
      ],
    },
    {
      weekdays: [6, 7],
      timeSpanGroups: [
        {
          rule: { id: undefined, group: 1, type: 'week_every' },
          timeSpans: [
            {
              id: 14691,
              description: { fi: 'Viikonlopun aukiolot', sv: null, en: null },
              end_time: '16:00',
              full_day: false,
              resource_state: ResourceState.OTHER,
              start_time: '12:00',
            },
          ],
        },
      ],
    },
  ],
  id: 1,
  resourceState: ResourceState.UNDEFINED,
  override: false,
};
