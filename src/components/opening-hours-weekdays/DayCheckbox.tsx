import React from 'react';
import { Language } from '../../common/lib/types';
import { getWeekdayShortNameByIndexAndLang } from '../../common/utils/date-time/format';
import './DayCheckbox.scss';

const DayCheckbox = ({
  currentDay,
  namePrefix,
  onChange,
  checked,
}: {
  currentDay: number;
  namePrefix: string;
  onChange: (checked: boolean) => void;
  checked?: boolean;
}): JSX.Element => {
  const id = `${namePrefix}-weekdays-${currentDay}`;

  return (
    <label htmlFor={id} className="day-label">
      <input
        id={id}
        type="checkbox"
        onChange={(): void => {
          const newChecked = !checked;
          onChange(newChecked);
        }}
        checked={checked}
      />
      <span className="day-option">
        {getWeekdayShortNameByIndexAndLang({
          weekdayIndex: currentDay,
          language: Language.FI,
        })}
      </span>
    </label>
  );
};

export default DayCheckbox;
