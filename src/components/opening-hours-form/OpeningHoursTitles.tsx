import React from 'react';
import { TextInput } from 'hds-react';
import { useFormContext } from 'react-hook-form';
import './OpeningHoursTitles.scss';
import { DatePeriod } from '../../common/lib/types';

const OpeningHoursTitles = (): JSX.Element => {
  const { register } = useFormContext<DatePeriod>();

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
        placeholder="T.ex. sommartid"
      />
      <TextInput
        {...register('name.en')}
        data-test="opening-period-title-en"
        id="title-en"
        name="name.en"
        label="Aukioloajan otsikko englanniksi"
        placeholder="E.g. summertime"
      />
    </div>
  );
};

export default OpeningHoursTitles;
