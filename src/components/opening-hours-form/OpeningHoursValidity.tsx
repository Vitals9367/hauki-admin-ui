import { DateInput, RadioButton, SelectionGroup } from 'hds-react';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useAppContext } from '../../App-context';
import { Language, OpeningHoursFormValues } from '../../common/lib/types';
import './OpeningHoursValidity.scss';

const OpeningHoursValidity = (): JSX.Element => {
  const { language = Language.FI } = useAppContext();
  const { control, register, watch } = useFormContext<OpeningHoursFormValues>();
  const fixed = watch('fixed');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  return (
    <div className="card opening-hours-validity">
      <h3 className="opening-hours-validity__title">
        Aukiolon voimassaoloaika
      </h3>
      <div className="opening-hours-validity__selections">
        <Controller
          control={control}
          name="fixed"
          render={({ name, onChange, value }): JSX.Element => (
            <>
              <SelectionGroup label="">
                <RadioButton
                  id="opening-hours-validity-recurring"
                  checked={!value}
                  name={name}
                  label="Toistaiseksi voimassa"
                  value={value}
                  onChange={(): void => onChange(false)}
                />
                <RadioButton
                  data-test="opening-hours-validity-fixed-option"
                  id="opening-hours-validity-fixed"
                  checked={value}
                  name={name}
                  label="Voimassa tietyn ajan"
                  value={value}
                  onChange={(): void => onChange(true)}
                />
              </SelectionGroup>
              <div className="opening-hours-validity__dates">
                <DateInput
                  data-test="opening-period-begin-date"
                  ref={register()}
                  id="opening-hours-start-date"
                  className="opening-hours-validity__date"
                  disableConfirmation
                  initialMonth={new Date()}
                  label="Astuu voimaan"
                  language={language}
                  name="startDate"
                  openButtonAriaLabel="Valitse alkupäivämäärä"
                  value={startDate ?? ''}
                />
                {fixed && (
                  <>
                    <span className="opening-hours-validity__range-divider">
                      -
                    </span>
                    <DateInput
                      data-test="opening-period-end-date"
                      ref={register()}
                      id="opening-hours-end-date"
                      className="opening-hours-validity__date"
                      disableConfirmation
                      initialMonth={new Date()}
                      label="Päättyy"
                      language={language}
                      name="endDate"
                      openButtonAriaLabel="Valitse loppupäivämäärä"
                      value={endDate ?? ''}
                    />
                  </>
                )}
              </div>
            </>
          )}
        />
      </div>
    </div>
  );
};

export default OpeningHoursValidity;
