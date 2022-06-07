import { LanguageStrings, ResourceState } from '../../common/lib/types';

export type OptionType<T = string> = { value: T; label: string | null };

export type OpeningHoursTimeSpan = {
  description?: LanguageStrings;
  end_time: string | null;
  full_day?: boolean;
  resource_state?: ResourceState;
  start_time: string | null;
};

export type OpeningHoursTimeSpanGroup = {
  rule: Rule;
  timeSpans: OpeningHoursTimeSpan[];
};

export type OpeningHours = {
  weekdays: number[];
  timeSpanGroups: OpeningHoursTimeSpanGroup[];
};

export type OpeningHoursFormValues = {
  name: LanguageStrings;
  openingHours: OpeningHours[];
  startDate: string | null;
  scheduled: boolean;
};

export type PreviewOpeningHours = {
  timeSpans: OpeningHoursTimeSpan[];
  weekdays: number[];
};

export type PreviewRow = {
  rule: Rule;
  openingHours: PreviewOpeningHours[];
};

export type Rule = 'week_every' | 'week_odd' | 'week_even';
