import React from 'react';
import {
  Language,
  DatePeriod,
  UiDatePeriodConfig,
} from '../../../common/lib/types';
import { formatDateRange } from '../../../common/utils/date-time/format';
import './OpeningPeriod.scss';
import OpeningHoursPreview from '../../opening-hours-preview/OpeningHoursPreview';
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
  const datePeriodName = datePeriod.name[language];
  const formattedDateRange = formatDateRange({
    startDate: datePeriod.startDate,
    endDate: datePeriod.endDate,
  });

  return (
    <OpeningPeriodAccordion
      id={`${datePeriod.id}`}
      periodName={datePeriodName}
      dateRange={formattedDateRange}
      onDelete={(): Promise<void> => {
        if (datePeriod.id) {
          return deletePeriod(datePeriod.id);
        }
        return Promise.resolve();
      }}
      editUrl={
        parentId
          ? `/resource/${parentId}/child/${resourceId}/period/${datePeriod.id}`
          : `/resource/${resourceId}/period/${datePeriod.id}`
      }
      initiallyOpen={initiallyOpen}
      isActive={current}>
      <div className="date-period-details-container">
        <OpeningHoursPreview
          openingHours={datePeriod.openingHours}
          resourceStates={datePeriodConfig.resourceState.options}
        />
      </div>
    </OpeningPeriodAccordion>
  );
}
