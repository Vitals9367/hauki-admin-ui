import { ResourceState } from '../../common/lib/types';

export type OptionType = { value: string; label: string | null };

export type Days = {
  1: boolean;
  2: boolean;
  3: boolean;
  4: boolean;
  5: boolean;
  6: boolean;
  7: boolean;
};

export type OpeningHoursTimeSpan = {
  start?: string;
  end?: string;
  fullDay?: boolean;
  state?: ResourceState;
  description?: string;
};

export type AlternatingOpeningHours = {
  rule: OptionType;
} & OpeningHours;

export type OpeningHours = {
  normal?: OpeningHoursTimeSpan;
  details?: OpeningHoursTimeSpan[];
};

export type OpeningHoursRange = {
  days: Days;
  isOpen?: boolean;
  openingHours?: OpeningHours;
  alternating?: AlternatingOpeningHours[];
};

export type OpeningHoursFormState = {
  openingHours: OpeningHoursRange[];
};
