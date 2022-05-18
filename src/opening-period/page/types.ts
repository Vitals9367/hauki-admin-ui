import { LanguageStrings, ResourceState } from '../../common/lib/types';

export type OptionType = { value: string; label: string | null };

export type OpeningHoursTimeSpan = {
  start?: string;
  end?: string;
  fullDay?: boolean;
  resourceState?: ResourceState;
  description?: LanguageStrings;
};

export type AlternatingOpeningHour = {
  rule: OptionType;
  timeSpans: OpeningHoursTimeSpan[];
};

export type OpeningHours = {
  days: number[];
  isOpen?: boolean;
  timeSpans?: OpeningHoursTimeSpan[];
  alternating?: AlternatingOpeningHour[];
};
