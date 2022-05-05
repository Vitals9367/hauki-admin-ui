import { ResourceState } from '../../common/lib/types';

export type OptionType = { value: string; label: string | null };

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
  days: number[];
  isOpen?: boolean;
  openingHours?: OpeningHours;
  alternating?: AlternatingOpeningHours[];
};

export type OpeningHoursFormState = {
  openingHours: OpeningHoursRange[];
};
