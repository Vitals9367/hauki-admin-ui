import { ResourceState } from '../lib/types';
import { openingHoursToPreviewRows } from './preview-helpers';

describe('preview-helpers', () => {
  const openingHours = [
    {
      weekdays: [1, 2, 3, 4, 5],
      timeSpanGroups: [
        {
          rule: 'week_every' as const,
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
          rule: 'week_every' as const,
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
              end_time: '16:00',
              full_day: false,
              resource_state: ResourceState.CLOSED,
              start_time: '17:00',
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

  it('should return opening hours grouped correctly', () => {
    expect(openingHoursToPreviewRows(openingHours)).toMatchInlineSnapshot(`
      Array [
        Object {
          "openingHours": Array [
            Object {
              "timeSpans": Array [
                Object {
                  "description": Object {
                    "en": null,
                    "fi": null,
                    "sv": null,
                  },
                  "end_time": "16:00",
                  "full_day": false,
                  "resource_state": "open",
                  "start_time": "08:00",
                },
                Object {
                  "description": Object {
                    "en": null,
                    "fi": null,
                    "sv": null,
                  },
                  "end_time": "17:00",
                  "full_day": false,
                  "resource_state": "self_service",
                  "start_time": "16:00",
                },
              ],
              "weekdays": Array [
                1,
                2,
                3,
                4,
                5,
              ],
            },
            Object {
              "timeSpans": Array [
                Object {
                  "description": Object {
                    "en": null,
                    "fi": null,
                    "sv": null,
                  },
                  "end_time": "16:00",
                  "full_day": false,
                  "resource_state": "open",
                  "start_time": "10:00",
                },
                Object {
                  "description": Object {
                    "en": null,
                    "fi": null,
                    "sv": null,
                  },
                  "end_time": "16:00",
                  "full_day": false,
                  "resource_state": "closed",
                  "start_time": "17:00",
                },
              ],
              "weekdays": Array [
                6,
              ],
            },
            Object {
              "timeSpans": Array [
                Object {
                  "description": Object {
                    "en": null,
                    "fi": null,
                    "sv": null,
                  },
                  "end_time": null,
                  "full_day": false,
                  "resource_state": "open",
                  "start_time": null,
                },
              ],
              "weekdays": Array [
                7,
              ],
            },
          ],
          "rule": "week_every",
        },
      ]
    `);
  });
});
