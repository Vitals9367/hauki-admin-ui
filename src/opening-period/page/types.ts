import { LanguageStrings, ResourceState } from '../../common/lib/types';

export type OptionType = { value: string; label: string | null };

export type OpeningHoursTimeSpan = {
  start_time: string | null;
  end_time: string | null;
  full_day?: boolean;
  resource_state?: ResourceState;
  description?: LanguageStrings;
};

export type AlternatingOpeningHour = {
  rule: OptionType;
  timeSpans: OpeningHoursTimeSpan[];
};

export type OpeningHours = {
  weekdays: number[];
  timeSpans: OpeningHoursTimeSpan[];
  alternating?: AlternatingOpeningHour[];
};
