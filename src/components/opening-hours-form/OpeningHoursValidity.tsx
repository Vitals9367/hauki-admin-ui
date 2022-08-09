import { DateInput, RadioButton, SelectionGroup } from 'hds-react';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useAppContext } from '../../App-context';
import { Language, OpeningHoursFormValues } from '../../common/lib/types';
import './OpeningHoursValidity.scss';

const OpeningHoursValidity = (): JSX.Element => {
  const { language = Language.FI } = useAppContext();
  const { control, watch } = useFormContext<OpeningHoursFormValues>();
  const fixed = watch('fixed');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  return (
    <div className="card opening-hours-validity">
      <h3 className="opening-hours-validity__title">
        Aukiolon voimassaoloaika*
      </h3>
      <div className="opening-hours-validity__selections">
        <Controller
          control={control}
          name="fixed"
          render={({ field: { name, onChange, value } }): JSX.Element => (
            <>
              <SelectionGroup label="">
                <RadioButton
                  id="opening-hours-validity-recurring"
                  checked={!value}
                  name={name}
                  label="Toistaiseksi voimassa"
                  value="recurring"
                  onChange={(): void => onChange(false)}
                />
                <RadioButton
                  data-test="opening-hours-validity-fixed-option"
                  id="opening-hours-validity-fixed"
                  checked={value}
                  name={name}
                  label="Voimassa tietyn ajan"
                  value="fixed"
                  onChange={(): void => onChange(true)}
                />
              </SelectionGroup>
              <div className="opening-hours-validity__dates">
                <Controller
                  defaultValue={startDate ?? ''}
                  name="startDate"
                  render={({ field: startDateField }): JSX.Element => (
                    <DateInput
                      className="opening-hours-validity__date"
                      data-test="opening-period-begin-date"
                      disableConfirmation
                      id="opening-hours-start-date"
                      initialMonth={new Date()}
                      label="Astuu voimaan"
                      language={language}
                      name={startDateField.name}
                      onBlur={startDateField.onBlur}
                      onChange={startDateField.onChange}
                      openButtonAriaLabel="Valitse alkupäivämäärä"
                      value={startDateField.value}
                    />
                  )}
                />
                {fixed && (
                  <>
                    <span className="opening-hours-validity__range-divider">
                      -
                    </span>
                    <Controller
                      defaultValue={endDate ?? ''}
                      name="endDate"
                      render={({ field: endDateField }): JSX.Element => (
                        <DateInput
                          className="opening-hours-validity__date"
                          data-test="opening-period-end-date"
                          disableConfirmation
                          id="opening-hours-end-date"
                          initialMonth={new Date()}
                          label="Päättyy"
                          language={language}
                          name={endDateField.name}
                          onBlur={endDateField.onBlur}
                          onChange={endDateField.onChange}
                          openButtonAriaLabel="Valitse loppupäivämäärä"
                          value={endDateField.value}
                        />
                      )}
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
