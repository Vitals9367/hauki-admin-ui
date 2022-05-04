export type OptionType = { value: string; label: string | null };

export type Days = {
  Ma: boolean;
  Ti: boolean;
  Ke: boolean;
  To: boolean;
  Pe: boolean;
  La: boolean;
  Su: boolean;
};

export type OpeningHoursTimeSpan = {
  start: string;
  end: string;
  fullDay: boolean;
  state?: OptionType;
  description?: string;
};

type AlternatingOpeningHours = {
  rule: OptionType;
} & OpeningHours;

type OpeningHours = {
  normal: OpeningHoursTimeSpan;
  details: OpeningHoursTimeSpan[];
};

export type OpeningHoursRange = {
  days: Days;
  isOpen: boolean;
  normal?: OpeningHours;
  alternating: AlternatingOpeningHours[];
};

export type OpeningHoursFormState = {
  openingHours: OpeningHoursRange[];
};
