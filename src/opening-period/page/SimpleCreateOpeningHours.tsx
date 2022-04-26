import { Button, Select, TimeInput } from 'hds-react';
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

  return (
    <div className="opening-hours-range__time-span">
      <div className="opening-hours-range__time-span-inputs">
        <TimeInput
          disabled={disabled}
          id="startDate"
          hoursLabel="tunnit"
          minutesLabel="minuutit"
          value={defaultValues?.startTime}
        />
        <div>-</div>
        <TimeInput
          disabled={disabled}
          id="startDate"
          hoursLabel="tunnit"
          minutesLabel="minuutit"
          value={defaultValues?.endTime}
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
  defaultIOpen,
  defaultValues,
  onDelete,
  resourceStates,
}: {
  defaultValues?: DefaultValues;
  defaultIOpen: boolean;
  onDelete?: () => void;
  resourceStates: OptionType[];
}) => {
  const [open, setOpen] = useState(defaultIOpen);
  const [exceptions, setExceptions] = useState(0);
  return (
    <div>
      <div className="opening-hours-range__selections">
        <div className="opening-hours-ranges__switch-buttons">
          <SwitchButtons
            labels={{ on: 'Auki', off: 'Kiinni' }}
            onChange={() => setOpen(!open)}
            value={open}
          />
        </div>
        <div className="opening-hours-range__time-spans">
          <div className="opening-hours__time-span-container">
            <OpeningHoursRangeTimeSpan
              disabled={!open}
              defaultValues={defaultValues}
              resourceStates={resourceStates}
            />
            {onDelete && (
              <Button variant="danger" onClick={onDelete}>
                Poista
              </Button>
            )}
          </div>
          {open &&
            Array.from(Array(exceptions).keys()).map(() => (
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
            {open && (
              <button
                className="link-button"
                onClick={() => setExceptions((i) => i + 1)}
                type="button">
                + Lisää tarkennus
              </button>
            )}
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
  label,
  defaultIOpen = true,
  resourceStates,
  defaultValues,
}: {
  label: string;
  defaultIOpen?: boolean;
  resourceStates: OptionType[];
  defaultValues?: DefaultValues;
}): JSX.Element => {
  const [varyingOpeningHours, setVaryingOpeningHours] = useState<number>(0);
  const options = [
    { value: '0', label: 'Joka toinen viikko' },
    { value: '1', label: 'Joka kolmas viikko' },
    { value: '2', label: 'Joka neljäs viikko' },
  ];
  return (
    <div>
      <div className="opening-hours-range">
        <div className="opening-hours-range__label">{label}</div>
        <OpeningHoursRangeSelections
          defaultIOpen={defaultIOpen}
          defaultValues={defaultValues}
          resourceStates={resourceStates}
        />
      </div>
      {Array.from(Array(varyingOpeningHours).keys()).map(() => (
        <div className="opening-hours-range">
          <Select<OptionType>
            label="Sääntö"
            options={options}
            className="variable-opening-hours-select"
            placeholder="Valitse"
            required
            defaultValue={options[0]}
          />
          <OpeningHoursRangeSelections
            defaultIOpen={defaultIOpen}
            defaultValues={defaultValues}
            onDelete={() =>
              setVaryingOpeningHours((prevState) => prevState - 1)
            }
            resourceStates={resourceStates}
          />
        </div>
      ))}
      <div>
        <button
          className="link-button add-variable-opening-hours-button"
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
  const [separateWeekdays, setSeparateWeekdays] = useState(false);
  const history = useHistory();
  const returnToResourcePage = (): void =>
    history.push(`/resource/${resourceId}`);

  const defaultWeekendValueValue = {
    startTime: '09:00',
    endTime: '15:00',
    state: ResourceState.OPEN,
  };

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
          <div className="separate-weekdays-section">
            <span className="separate-weekdays-section__label">
              Erottele arkipäivät
            </span>

            <SwitchButtons
              labels={{ on: 'Kyllä', off: 'Ei' }}
              onChange={() => setSeparateWeekdays(!separateWeekdays)}
              value={separateWeekdays}
            />
          </div>
          <section className="opening-hours-section">
            {separateWeekdays &&
              [
                'Maanantai',
                'Tiistai',
                'Keskiviikko',
                'Torstai',
                'Perjantai',
              ].map((day) => (
                <OpeningHoursRange
                  label={day}
                  resourceStates={resourceStates}
                  defaultValues={{
                    startTime: '09:00',
                    endTime: '20:00',
                    state: ResourceState.OPEN,
                  }}
                />
              ))}
            {!separateWeekdays && (
              <OpeningHoursRange
                label="Ma-Pe"
                resourceStates={resourceStates}
                defaultValues={{
                  startTime: '09:00',
                  endTime: '20:00',
                  state: ResourceState.OPEN,
                }}
              />
            )}
            <OpeningHoursRange
              label="Lauantai"
              resourceStates={resourceStates}
              defaultIOpen={false}
              defaultValues={defaultWeekendValueValue}
            />
            <OpeningHoursRange
              label="Sunnuntai"
              resourceStates={resourceStates}
              defaultIOpen={false}
              defaultValues={defaultWeekendValueValue}
            />
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
