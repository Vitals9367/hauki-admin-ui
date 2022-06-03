import { LanguageStrings, ResourceState } from '../../common/lib/types';

export type OptionType = { value: string; label: string | null };

export type OpeningHoursTimeSpan = {
  description?: LanguageStrings;
  end_time: string | null;
  full_day?: boolean;
  resource_state?: ResourceState;
  start_time: string | null;
};

export type OpeningHoursTimeSpanGroup = {
  rule?: OptionType;
  timeSpans: OpeningHoursTimeSpan[];
};

export type OpeningHours = {
  weekdays: number[];
  timeSpanGroups: OpeningHoursTimeSpanGroup[];
};

export type OpeningHoursFormState = {
  openingHours: OpeningHours[];
};

export type PreviewOpeningHours = {
  timeSpans: OpeningHoursTimeSpan[];
  weekdays: number[];
};

export type PreviewRow = {
  rule?: OptionType;
  openingHours: PreviewOpeningHours[];
};
