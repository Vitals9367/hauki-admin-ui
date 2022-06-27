import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  DatePeriod,
  Language,
  UiDatePeriodConfig,
} from '../../../common/lib/types';
import { formatDateRange } from '../../../common/utils/date-time/format';
import './OpeningPeriod.scss';
import OpeningHoursPreview from '../../opening-hours-preview/OpeningHoursPreview';
import { apiDatePeriodToOpeningHours } from '../../../common/helpers/opening-hours-helpers';
import OpeningPeriodAccordion from '../../opening-period-accordion/OpeningPeriodAccordion';

export default function OpeningPeriod({
  current = false,
  resourceId,
  datePeriod,
  datePeriodConfig,
  language,
  deletePeriod,
  initiallyOpen = false,
  parentId,
}: {
  current?: boolean;
  resourceId: number;
  datePeriod: DatePeriod;
  datePeriodConfig: UiDatePeriodConfig;
  language: Language;
  deletePeriod: (id: number) => Promise<void>;
  initiallyOpen: boolean;
  parentId?: number;
}): JSX.Element {
  const history = useHistory();
  const datePeriodName = datePeriod.name[language];
  const formattedDateRange = formatDateRange({
    startDate: datePeriod.start_date ?? null,
    endDate: datePeriod.end_date ?? null,
  });

  return (
    <OpeningPeriodAccordion
      id={datePeriod.id}
      periodName={datePeriodName}
      dateRange={formattedDateRange}
      onDelete={(): Promise<void> => deletePeriod(datePeriod.id!)}
      onEdit={(): void =>
        history.push(
          parentId
            ? `/resource/${parentId}/child/${resourceId}/period/${datePeriod.id}`
            : `/resource/${resourceId}/period/${datePeriod.id}`
        )
      }
      initiallyOpen={initiallyOpen}
      isActive={current}>
      <div className="date-period-details-container">
        <OpeningHoursPreview
          openingHours={apiDatePeriodToOpeningHours(datePeriod)}
          resourceStates={datePeriodConfig.resourceState.options}
        />
      </div>
    </OpeningPeriodAccordion>
  );
}
