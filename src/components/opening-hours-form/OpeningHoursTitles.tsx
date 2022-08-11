import React from 'react';
import { TextInput } from 'hds-react';
import { useFormContext } from 'react-hook-form';
import './OpeningHoursTitles.scss';
import { OpeningHoursFormValues } from '../../common/lib/types';

const OpeningHoursTitles = (): JSX.Element => {
  const { register } = useFormContext<OpeningHoursFormValues>();

  return (
    <div className="card opening-hours-titles">
      <TextInput
        {...register('name.fi')}
        data-test="opening-period-title-fi"
        id="title-fi"
        dat-test="opening-period-title-fi"
        label="Aukioloajan otsikko suomeksi"
        placeholder="Esim. kesäkausi"
      />
      <TextInput
        {...register('name.sv')}
        data-test="opening-period-title-sv"
        id="title-sv"
        label="Aukioloajan otsikko ruotsiksi"
        placeholder="Till exempel (t.ex.) sommartid"
      />
      <TextInput
        {...register('name.en')}
        data-test="opening-period-title-en"
        id="title-en"
        name="name.en"
        label="Aukioloajan otsikko englanniksi"
        placeholder="For example (e.g.) summertime"
      />
    </div>
  );
};

export default OpeningHoursTitles;
