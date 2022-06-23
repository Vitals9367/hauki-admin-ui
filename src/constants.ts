import { LanguageStrings, ResourceState, Rule } from './common/lib/types';

export const uiFrequencyRules: { label: LanguageStrings; value: Rule }[] = [
  {
    value: 'week_every',
    label: { fi: 'Joka viikko', sv: 'Joka viikko', en: 'Joka viikko' },
  },
  {
    value: 'week_even',
    label: {
      fi: 'Parilliset viikot',
      sv: 'Parilliset viikot',
      en: 'Parilliset viikot',
    },
  },
  {
    value: 'week_odd',
    label: {
      fi: 'Parittomat viikot',
      sv: 'Parittomat viikot',
      en: 'Parittomat viikot',
    },
  },
];

export const defaultTimeSpan = {
  description: { fi: null, sv: null, en: null },
  start_time: null,
  end_time: null,
  full_day: false,
  resourceState: ResourceState.OPEN,
};
