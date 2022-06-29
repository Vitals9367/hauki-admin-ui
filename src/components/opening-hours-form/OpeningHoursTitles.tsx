import React from 'react';
import { TextInput } from 'hds-react';
import { useFormContext } from 'react-hook-form';
import './OpeningHoursTitles.scss';

const OpeningHoursTitles = (): JSX.Element => {
  const { register } = useFormContext();

  return (
    <div className="card opening-hours-titles">
      <TextInput
        data-test="opening-period-title-fi"
        ref={register()}
        id="title-fi"
        name="name.fi"
        dat-test="opening-period-title-fi"
        label="Aukioloajan otsikko suomeksi"
      />
      <TextInput
        data-test="opening-period-title-sv"
        ref={register()}
        id="title-sv"
        name="name.sv"
        label="Aukioloajan otsikko ruotsiksi"
      />
      <TextInput
        data-test="opening-period-title-en"
        ref={register()}
        id="title-en"
        name="name.en"
        label="Aukioloajan otsikko englanniksi"
      />
    </div>
  );
};

export default OpeningHoursTitles;
