import { getUiId } from './form';

describe('form', () => {
  describe('getUiId', () => {
    it('returns correctly sanitized id', () => {
      expect(
        getUiId([
          'openingHours[0].timeSpanGroups[0].timeSpans[0]',
          'start-time',
        ])
      ).toEqual('openingHours-0-timeSpanGroups-0-timeSpans-0-start-time');
    });
  });
});
