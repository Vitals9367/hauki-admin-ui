import { Button, Checkbox, Select, TimeInput } from 'hds-react';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Resource,
  ResourceState,
  UiDatePeriodConfig,
} from '../../common/lib/types';
import api from '../../common/utils/api/api';
import { SecondaryButton } from '../../components/button/Button';
import './SimpleCreateOpeningHours.scss';
import './SimpleCreateOpeningHours2.scss';

const DayCheckbox = ({
  children,
  checked,
  onChange,
}: {
  children: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}): JSX.Element => {
  const id = `id${+Math.random()}`;
  return (
    <label htmlFor={id} className="day-label">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          onChange(e.target.checked);
        }}
      />
      <span className="day-option">{children}</span>
    </label>
  );
};

const SwitchButton = ({
  isActive,
  label,
  onChange,
}: {
  isActive: boolean;
  label: string;
  onChange: () => void;
}): JSX.Element => (
  <Button
    className={`switch-buttons-button ${
      isActive ? 'switch-buttons-button--active' : ''
    }`}
    variant="secondary"
    onClick={(): void => onChange()}>
    {label}
  </Button>
);

const SwitchButtons = ({
  labels,
  value,
  onChange,
}: {
  labels: { on: string; off: string };
  value: boolean;
  onChange: (x: boolean) => void;
}): JSX.Element => (
  <div className="switch-buttons">
    <SwitchButton
      isActive={value}
      label={labels.on}
      onChange={(): void => onChange(true)}
    />
    <span className="switch-buttons-divider">/</span>
    <SwitchButton
      isActive={!value}
      label={labels.off}
      onChange={(): void => onChange(false)}
    />
  </div>
);

const OpeningHoursRangeTimeSpan = ({
  defaultValues,
  disabled = false,
  resourceStates,
}: {
  defaultValues?: {
    startTime: string;
    endTime: string;
    state: ResourceState;
  };
  disabled?: boolean;
  resourceStates: OptionType[];
}): JSX.Element => {
  const [state, setState] = useState(
    defaultValues?.state
      ? resourceStates.find(({ value }) => value === defaultValues.state)
      : undefined
  );
  const [fullDay, setFullDay] = useState(false);

  return (
    <div className="opening-hours-range__time-span">
      <div className="opening-hours-range__time-span-inputs">
        <TimeInput
          disabled={disabled || fullDay}
          id="startDate"
          hoursLabel="tunnit"
          minutesLabel="minuutit"
          value={defaultValues?.startTime}
        />
        <div>-</div>
        <TimeInput
          disabled={disabled || fullDay}
          id="startDate"
          hoursLabel="tunnit"
          minutesLabel="minuutit"
          value={defaultValues?.endTime}
        />
      </div>
      <div className="fullday-checkbox-container">
        <Checkbox
          id=""
          label="24h"
          checked={fullDay}
          onChange={() => setFullDay(!fullDay)}
        />
      </div>
      <Select<OptionType>
        disabled={disabled}
        label="Tila"
        options={resourceStates}
        className="opening-hours-range-select"
        onChange={setState}
        placeholder="Placeholder"
        value={state}
        required
      />
    </div>
  );
};

const OpeningHoursRangeSelections = ({
  defaultValues,
  resourceStates,
}: {
  defaultValues?: DefaultValues;
  resourceStates: OptionType[];
}) => {
  const [exceptions, setExceptions] = useState(0);

  return (
    <div>
      <div className="opening-hours-range__selections">
        <div className="opening-hours-range__time-spans">
          <div className="opening-hours__time-span-container">
            <OpeningHoursRangeTimeSpan
              defaultValues={defaultValues}
              resourceStates={resourceStates}
            />
          </div>
          {Array.from(Array(exceptions).keys()).map(() => (
            <div className="exception">
              <OpeningHoursRangeTimeSpan
                defaultValues={defaultValues}
                resourceStates={resourceStates}
              />
              <Button
                variant="danger"
                onClick={() => setExceptions((i) => i - 1)}>
                Poista
              </Button>
            </div>
          ))}
          <div>
            <button
              className="link-button"
              onClick={() => setExceptions((i) => i + 1)}
              type="button">
              + Lisää tarkennus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

type OptionType = { value: string; label: string };

type DefaultValues = {
  startTime: string;
  endTime: string;
  state: ResourceState;
};

const OpeningHoursRange = ({
  defaultIOpen = true,
  resourceStates,
  defaultValues,
  days,
  onDayClick,
}: {
  defaultIOpen?: boolean;
  days: string[];
  resourceStates: OptionType[];
  defaultValues?: DefaultValues;
  onDayClick: (day: string, checked: boolean) => void;
}): JSX.Element => {
  const [varyingOpeningHours, setVaryingOpeningHours] = useState<number>(0);
  const options = [
    { value: '0', label: 'Joka toinen viikko' },
    { value: '1', label: 'Joka kolmas viikko' },
    { value: '2', label: 'Joka neljäs viikko' },
  ];

  const [open, setOpen] = useState(defaultIOpen);
  return (
    <div className="opening-hours-range-container">
      <div className="weekdays">
        <div>Päivä</div>
        <div className="weekdays-and-is-open-selector">
          {['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'].map((day: string) => (
            <DayCheckbox
              key={day}
              checked={days.includes(day)}
              onChange={(checked) => {
                onDayClick(day, checked);
              }}>
              {day}
            </DayCheckbox>
          ))}
          <SwitchButtons
            labels={{ on: 'Auki', off: 'Kiinni' }}
            onChange={() => setOpen(!open)}
            value={open}
          />
        </div>
      </div>
      {open && (
        <div className="opening-hours-range">
          <OpeningHoursRangeSelections
            defaultValues={defaultValues}
            resourceStates={resourceStates}
          />
        </div>
      )}
      {Array.from(Array(varyingOpeningHours).keys()).map(() => (
        <>
          <div className="container varying-opening-hour">
            <Select<OptionType>
              label="Sääntö"
              options={options}
              className="variable-opening-hours-select"
              placeholder="Valitse"
              required
              defaultValue={options[0]}
            />
            <Button
              variant="danger"
              onClick={() =>
                setVaryingOpeningHours((prevState) => prevState - 1)
              }>
              Poista
            </Button>
          </div>
          <div className="opening-hours-range">
            <OpeningHoursRangeSelections
              defaultValues={defaultValues}
              resourceStates={resourceStates}
            />
          </div>
        </>
      ))}
      <div className="container">
        <button
          className="link-button"
          onClick={() => setVaryingOpeningHours((prevState) => prevState + 1)}
          type="button">
          + Lisää vaihteleva aukioloaika
        </button>
      </div>
    </div>
  );
};

export default function CreateNewOpeningPeriodPage({
  resourceId,
}: {
  resourceId: string;
}): JSX.Element {
  const [resource, setResource] = useState<Resource>();
  const [datePeriodConfig, setDatePeriodConfig] = useState<
    UiDatePeriodConfig
  >();
  const history = useHistory();
  const returnToResourcePage = (): void =>
    history.push(`/resource/${resourceId}`);

  // const defaultWeekendValueValue = {
  //   startTime: '09:00',
  //   endTime: '15:00',
  //   state: ResourceState.OPEN,
  // };

  const resourceStates = datePeriodConfig
    ? datePeriodConfig.resourceState.options.map((translatedApiChoice) => ({
        value: translatedApiChoice.value,
        label: translatedApiChoice.label.fi as string,
      }))
    : [];

  useEffect((): void => {
    const fetchData = async (): Promise<void> => {
      try {
        const [apiResource, uiDatePeriodOptions] = await Promise.all([
          api.getResource(resourceId),
          api.getDatePeriodFormConfig(),
        ]);
        setResource(apiResource);
        setDatePeriodConfig(uiDatePeriodOptions);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Add date-period - data initialization error:', e);
      }
    };

    fetchData();
  }, [resourceId]);

  const [individual, setIndividual] = useState<string[]>([]);
  const days = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];

  return (
    (resource && datePeriodConfig && (
      <div>
        <div className="opening-hours-form__title">
          <h1 data-test="resource-info" className="resource-info-title">
            {resource?.name?.fi}
          </h1>
          <span>Osoite: {resource?.address.fi}</span>
        </div>
        <div className="opening-hours-form">
          <section>
            {days.length > 0 && (
              <OpeningHoursRange
                resourceStates={resourceStates}
                days={days.filter((day) => !individual.includes(day))}
                onDayClick={(day, checked) => {
                  if (!checked) {
                    setIndividual((prevState) => [...prevState, day]);
                  }
                }}
                defaultValues={{
                  startTime: '09:00',
                  endTime: '20:00',
                  state: ResourceState.OPEN,
                }}
              />
            )}
            {individual
              .sort((a, b) => days.indexOf(a) - days.indexOf(b))
              .map((day) => (
                <OpeningHoursRange
                  key={day}
                  resourceStates={resourceStates}
                  days={[day]}
                  onDayClick={(d, checked) => {
                    if (!checked) {
                      setIndividual((prevState) =>
                        prevState.filter((i) => i !== d)
                      );
                    }
                  }}
                  defaultValues={{
                    startTime: '09:00',
                    endTime: '20:00',
                    state: ResourceState.OPEN,
                  }}
                />
              ))}
          </section>
          <div className="opening-hours-form__buttons">
            <Button onClick={returnToResourcePage}>Tallenna</Button>
            <SecondaryButton onClick={returnToResourcePage}>
              Peruuta
            </SecondaryButton>
          </div>
        </div>
      </div>
    )) || <h1>Ladataan...</h1>
  );
}
