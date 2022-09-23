import { Notification, Select } from 'hds-react';
import { upperFirst } from 'lodash';
import React, { Fragment, useEffect, useRef } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import {
  Language,
  TranslatedApiChoice,
  OpeningHours as TOpeningHours,
  DatePeriod,
  RuleType,
  Rule,
  InputOption,
} from '../../common/lib/types';
import { getWeekdayLongNameByIndexAndLang } from '../../common/utils/date-time/format';
import TimeSpans from '../time-span/TimeSpans';
import DayCheckbox from './DayCheckbox';
import './OpeningHoursWeekdays.scss';
import {
  defaultRule,
  defaultTimeSpanGroup,
  uiRuleLabels,
} from '../../constants';
import { useAppContext } from '../../App-context';
import { getUiId } from '../../common/utils/form/form';

type InflectLabels = {
  [language in Language]: {
    [x: number]: string;
  };
};

const languageGenitiveInflects: InflectLabels = {
  fi: {
    3: 'keskiviikon',
  },
  sv: {},
  en: {},
};

const isOnlySelectedDay = (day: number, weekdays: number[]): boolean =>
  weekdays.length === 1 && weekdays[0] === day;

const OpeningHoursWeekdays = ({
  dropIn,
  i: openingHoursIdx,
  item,
  offsetTop = 0,
  resourceStates,
  rules: ruleValues,
  onDayChange,
}: {
  dropIn: boolean;
  i: number;
  item: TOpeningHours;
  offsetTop?: number;
  resourceStates: TranslatedApiChoice[];
  rules: Rule[];
  onDayChange: (day: number, checked: boolean, offsetTop: number) => void;
}): JSX.Element => {
  const namePrefix = `openingHours.${openingHoursIdx}` as const;
  const { language = Language.FI } = useAppContext();
  const { control, setValue, watch } = useFormContext<DatePeriod>();
  const { append, fields, remove } = useFieldArray({
    control,
    name: `${namePrefix}.timeSpanGroups`,
  });
  const [removedDay, setRemovedDay] = React.useState<number | null>(null);
  const [isMoving, setIsMoving] = React.useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rules: InputOption<RuleType>[] = ruleValues.map((rule) => ({
    label: uiRuleLabels[rule.type][language],
    value: rule.type,
  }));

  useEffect(() => {
    if (dropIn && ref.current) {
      const dropInAnimation = [
        {
          marginTop: `-${
            ref.current.getBoundingClientRect().top - offsetTop
          }px`,
        },
        { marginTop: 0 },
      ];
      setIsMoving(true);
      ref.current
        .animate(dropInAnimation, {
          duration: 600,
          iterations: 1,
          easing: 'ease',
        })
        .addEventListener('finish', () => setIsMoving(false));
    }
  }, [dropIn, offsetTop, ref, setIsMoving]);

  const weekdays = watch(
    `openingHours.${openingHoursIdx}.weekdays`,
    []
  ) as number[];

  const removedDayLabel = removedDay
    ? getWeekdayLongNameByIndexAndLang({
        weekdayIndex: removedDay,
        language: Language.FI,
      })
    : '';

  const groupWeekdays = (weekdaysToIterate: number[]): number[][] =>
    [...weekdaysToIterate]
      .sort((a, b) => a - b)
      .reduce((acc: number[][], day): number[][] => {
        const lastSet = acc.length > 0 ? acc[acc.length - 1] : [];
        if (lastSet.length === 0) {
          return [[day]];
        }
        if (lastSet && lastSet[lastSet.length - 1] + 1 === day) {
          return [...acc.slice(0, acc.length - 1), [...lastSet, day]];
        }
        return [...acc, [day]];
      }, []);

  const resolveDayTranslation = (day: number, useGenitive: boolean): string => {
    const translatedDay = getWeekdayLongNameByIndexAndLang({
      weekdayIndex: day,
      language,
    });

    return useGenitive
      ? (languageGenitiveInflects[language] &&
          languageGenitiveInflects[language][day]) ||
          `${translatedDay}n`
      : translatedDay;
  };

  const weekdayGroup = upperFirst(
    item.weekdays.length === 1
      ? `${resolveDayTranslation(item.weekdays[0], true)} aukioloajat`
      : `${groupWeekdays(item.weekdays)
          .map((group) =>
            group.length === 1
              ? resolveDayTranslation(group[0], false)
              : `${resolveDayTranslation(
                  group[0],
                  false
                )}-${resolveDayTranslation(group[group.length - 1], false)}`
          )
          .join(', ')} aukioloajat`
  );

  return (
    <div
      ref={containerRef}
      style={{ zIndex: isMoving ? 1 : undefined }}
      role="group"
      aria-label={`Aukiolomääritys ${openingHoursIdx + 1}`}>
      <div ref={ref} className="card opening-hours-container">
        <div>
          <div
            id={getUiId([namePrefix, 'weekdays'])}
            className="weekdays-label">
            Päivä tai päiväryhmä
          </div>
          <div
            className="weekdays"
            role="group"
            aria-labelledby={getUiId([namePrefix, 'weekdays'])}>
            {removedDay && (
              <Notification
                key={removedDay}
                label={`${upperFirst(
                  removedDayLabel
                )}-päivä siirretty omaksi riviksi`}
                position="bottom-right"
                dismissible
                autoClose
                displayAutoCloseProgress={false}
                closeButtonLabelText="Sulje ilmoitus"
                onClose={(): void => setRemovedDay(null)}
                style={{ zIndex: 100 }}>
                {`Juuri poistettu ${removedDayLabel} siirrettiin omaksi rivikseen.`}
              </Notification>
            )}
            <Controller
              control={control}
              defaultValue={item.weekdays ?? []}
              name={`openingHours.${openingHoursIdx}.weekdays`}
              render={(): JSX.Element => (
                <>
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <DayCheckbox
                      key={`${namePrefix}-${day}`}
                      checked={weekdays.includes(day)}
                      currentDay={day}
                      namePrefix={namePrefix}
                      onChange={(checked): void => {
                        onDayChange(
                          day,
                          checked,
                          ref.current?.getBoundingClientRect().top || 0
                        );
                        if (
                          !isOnlySelectedDay(day, item.weekdays) &&
                          !checked
                        ) {
                          setRemovedDay(day);
                        }
                      }}
                    />
                  ))}
                </>
              )}
            />
          </div>
        </div>
        <div className="opening-hours-group" role="group">
          {fields.map((field, i) => (
            <Fragment key={field.id}>
              <Controller
                defaultValue={field.rule || defaultRule}
                name={`${namePrefix}.timeSpanGroups.${i}.rule`}
                control={control}
                render={({ field: { onChange, value } }): JSX.Element => (
                  <>
                    <Select<InputOption<RuleType>>
                      className="rule-select"
                      defaultValue={rules[0]}
                      label="Toistuvuus"
                      onChange={(rule: InputOption<RuleType>): void => {
                        const toValue = (ruleType: RuleType): Rule =>
                          ruleValues.find((elem) => elem.type === ruleType) ||
                          defaultRule;

                        onChange(toValue(rule.value));

                        const counterparts: { [key in RuleType]: RuleType } = {
                          week_even: 'week_odd',
                          week_odd: 'week_even',
                          week_every: 'week_every',
                        };

                        const pair: { idx: number; newValue: RuleType } = {
                          idx: i === 0 ? 1 : 0, // We allow only two rules to exists at a time
                          newValue: counterparts[rule.value],
                        };

                        if (fields.length === 1) {
                          append({
                            ...defaultTimeSpanGroup,
                            rule: toValue(pair.newValue),
                          });
                        } else if (rule.value === 'week_every') {
                          remove(pair.idx);
                        } else {
                          setValue(
                            `${namePrefix}.timeSpanGroups.${pair.idx}.rule`,
                            toValue(pair.newValue)
                          );
                        }
                      }}
                      options={rules}
                      placeholder="Valitse"
                      required
                      value={rules.find((rule) => rule.value === value.type)}
                    />
                    <div
                      role="group"
                      aria-label={
                        weekdayGroup +
                        (value.type === 'week_every'
                          ? ''
                          : ` ${rules
                              .find((rule) => rule.value === value.type)
                              ?.label.toLowerCase()}`)
                      }>
                      <TimeSpans
                        openingHoursIdx={openingHoursIdx}
                        resourceStates={resourceStates}
                        timeSpanGroupIdx={i}
                      />
                    </div>
                  </>
                )}
              />
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OpeningHoursWeekdays;
