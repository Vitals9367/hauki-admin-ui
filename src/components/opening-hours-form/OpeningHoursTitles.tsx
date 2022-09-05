import React from 'react';
import { TextInput } from 'hds-react';
import { useFormContext } from 'react-hook-form';
import './OpeningHoursTitles.scss';
import { DatePeriod, LanguageStrings } from '../../common/lib/types';

type Props = {
  placeholders: LanguageStrings;
};

const OpeningHoursTitles = ({ placeholders }: Props): JSX.Element => {
  const { register } = useFormContext<DatePeriod>();

  return (
    <div className="card opening-hours-titles">
      <div className="opening-hours-titles-inputs">
        <TextInput
          {...register('name.fi')}
          aria-describedby="title-fi-helper-text"
          data-test="opening-period-title-fi"
          id="title-fi"
          label="Aukioloajan otsikko suomeksi"
          placeholder={placeholders.fi ?? ''}
        />
        <TextInput
          {...register('name.sv')}
          data-test="opening-period-title-sv"
          id="title-sv"
          label="Aukioloajan otsikko ruotsiksi"
          placeholder={placeholders.sv ?? ''}
        />
        <TextInput
          {...register('name.en')}
          data-test="opening-period-title-en"
          id="title-en"
          name="name.en"
          label="Aukioloajan otsikko englanniksi"
          placeholder={placeholders.en ?? ''}
        />
      </div>
      <p className="titles-helper-text" id="title-fi-helper-text">
        Otsikko ei ole pakollinen. Tähän kohtaan voit kirjoittaa esim talviaika,
        kevätkausi ym. Älä kirjoita aukiolokohdetta esim sauna, uima-allas,
        kerros tms.
      </p>
    </div>
  );
};

export default OpeningHoursTitles;
