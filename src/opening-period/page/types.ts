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
  state: OptionType;
  description?: string;
};

type VariableOpeningHours = {
  rule: OptionType;
} & OpeningHours;

type OpeningHours = {
  normal: OpeningHoursTimeSpan;
  exceptions: OpeningHoursTimeSpan[];
};

type OpeningHoursRange = {
  days: Days;
  isOpen: boolean;
  normal?: OpeningHours;
  variable: VariableOpeningHours[];
};

export type State = {
  openingHours: OpeningHoursRange[];
};
