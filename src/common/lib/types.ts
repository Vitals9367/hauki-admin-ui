export enum Language {
  FI = 'fi',
  SV = 'sv',
  EN = 'en',
}

export type LanguageOption = {
  label: string;
  value: Language;
};

export type LanguageStrings = {
  [x in Language]: string | null;
};

export enum ResourceState {
  OPEN = 'open',
  SELF_SERVICE = 'self_service',
  CLOSED = 'closed',
  OTHER = 'other',
  UNDEFINED = 'undefined',
}

export enum WeekdayTypes {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}

export type Weekdays = Array<WeekdayTypes>;

export type ApiTimeSpan = {
  start_time: string | null;
  end_time: string | null;
  weekdays: Weekdays | null;
  id?: number;
  created?: string;
  modified?: string;
  is_removed?: boolean;
  name?: LanguageStrings;
  description: LanguageStrings;
  full_day?: boolean;
  resource_state?: ResourceState;
  group?: number;
  end_time_on_next_day?: boolean;
};

export type ApiChoice = {
  value: string;
  display_name: string | LanguageStrings;
};

export type TranslatedApiChoice = Choice<string>;

export type InputOption<T = string> = {
  label: string;
  value: T;
};

export type TextFieldConfig = {
  max_length?: number;
};

type RuleOptionsFieldConfig = {
  choices: ApiChoice[];
  required: boolean;
};

export type DatePeriodOptions = {
  actions: {
    POST: {
      name: TextFieldConfig;
      resource_state: {
        choices: ApiChoice[];
      };
      time_span_groups: {
        child: {
          children: {
            rules: {
              child: {
                children: {
                  context: RuleOptionsFieldConfig;
                  frequency_modifier: RuleOptionsFieldConfig;
                  subject: RuleOptionsFieldConfig;
                  start: {
                    required: boolean;
                  };
                };
              };
            };
          };
        };
      };
    };
  };
};

type BaseFieldConfig = {
  required: boolean;
};

export type UiOptionsFieldConfig = {
  options: Choice<string>[];
};

type RuleFieldConfigWithTranslatedOptions = BaseFieldConfig &
  UiOptionsFieldConfig;

type RuleConfigWithTranslatedOptions = {
  context: RuleFieldConfigWithTranslatedOptions;
  subject: RuleFieldConfigWithTranslatedOptions;
  frequencyModifier: RuleFieldConfigWithTranslatedOptions;
  start: BaseFieldConfig;
};

export type UiDatePeriodConfig = {
  name: TextFieldConfig;
  resourceState: UiOptionsFieldConfig;
  timeSpanGroup: {
    rule: RuleConfigWithTranslatedOptions;
  };
};

export type UiFieldConfig = {
  options: InputOption[];
};

type UiFormRuleFieldConfig = BaseFieldConfig & UiFieldConfig;

export type UiFormRuleConfig = {
  context: UiFormRuleFieldConfig;
  subject: UiFormRuleFieldConfig;
  frequencyModifier: UiFormRuleFieldConfig;
  start: BaseFieldConfig;
};

export type Frequency = {
  frequency_ordinal: number | null;
  frequency_modifier: string | null;
};

interface BaseGroupRule extends Frequency {
  context: string;
  subject: string;
}

export interface GroupRule extends BaseGroupRule {
  id?: number;
  group?: number;
  name?: LanguageStrings;
  description?: LanguageStrings;
  created?: string;
  modified?: string;
  start?: number;
}

export interface ApiTimeSpanGroup {
  id?: number;
  period?: number;
  time_spans: ApiTimeSpan[];
  rules: GroupRule[];
}

export type ApiDatePeriod = {
  id?: number;
  created?: string;
  modified?: string;
  is_removed?: boolean;
  name: LanguageStrings;
  description: LanguageStrings;
  start_date: string | null;
  end_date: string | null;
  resource_state?: ResourceState;
  override: boolean;
  resource: number;
  time_span_groups: ApiTimeSpanGroup[];
};

export enum ResourceType {
  UNIT = 'unit',
  SECTION = 'section',
  SPECIAL_GROUP = 'special_group',
  CONTACT = 'contact',
  ONLINE_SERVICE = 'online_service',
  SERVICE = 'service',
  SERVICE_CHANNEL = 'service_channel',
  SERVICE_AT_UNIT = 'service_at_unit',
  RESERVABLE = 'reservable',
  BUILDING = 'building',
  AREA = 'area',
  ENTRANCE_OR_EXIT = 'entrance_or_exit',
}

export interface Resource {
  id: number;
  modified?: string;
  name: {
    fi: string;
    sv: string;
    en: string;
  };
  description: {
    fi: string;
    sv: string;
    en: string;
  };
  address: {
    fi: string;
    sv: string;
    en: string;
  };
  extra_data: {
    citizen_url: string;
    admin_url: string;
  };
  children: number[];
  parents: number[];
  resource_type: ResourceType;
}

export type TimeSpan = {
  id?: number;
  description: LanguageStrings;
  end_time: string | null;
  full_day?: boolean;
  resource_state?: ResourceState;
  start_time: string | null;
};

export type TimeSpanGroup = {
  id?: number;
  rule: Rule;
  timeSpans: TimeSpan[];
};

export type OpeningHours = {
  weekdays: number[];
  timeSpanGroups: TimeSpanGroup[];
};

export type DatePeriod = {
  id?: number;
  endDate: string | null;
  fixed: boolean;
  name: LanguageStrings;
  openingHours: OpeningHours[];
  startDate: string | null;
  override?: boolean;
  resourceState?: ResourceState;
};

export type PreviewOpeningHours = {
  timeSpans: TimeSpan[];
  weekdays: number[];
};

export type PreviewRow = {
  rule: Rule;
  openingHours: PreviewOpeningHours[];
};

export type Rule = 'week_every' | 'week_odd' | 'week_even';

export type Choice<T> = {
  value: T;
  label: LanguageStrings;
};

export type Holiday = {
  date: string;
  name: string;
};
