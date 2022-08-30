import { UiDatePeriodConfig } from '../common/lib/types';
import api from '../common/utils/api/api';

/**
 * The purpose of this service is to add support for the other resource state.
 * This does not belong in the api so we need to resolve it in the UI.
 * We need to make sure the when storing and retrieving the data
 * that it is mapped correctly. That is done in the opening-hours-helpers module.
 */
// eslint-disable-next-line import/prefer-default-export
export const getDatePeriodFormConfig = (): Promise<UiDatePeriodConfig> =>
  api.getDatePeriodFormConfig();
// .then((result) => ({
//   ...result,
//   resourceState: {
//     ...result.resourceState,
//     options: [
//       ...result.resourceState.options,
//       {
//         value: ResourceState.OTHER,
//         label: { fi: 'Muu, mikä?', sv: 'Muu, mikä?', en: 'Muu, mikä?' },
//       },
//     ],
//   },
// }));
