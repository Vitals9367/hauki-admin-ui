import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as querystring from 'querystring';
import { ParsedUrlQueryInput } from 'querystring';
import {
  ApiChoice,
  DatePeriod,
  UiDatePeriodConfig,
  DatePeriodOptions,
  LanguageStrings,
  Resource,
  ResourceState,
  TimeSpanGroup,
  TranslatedApiChoice,
  Language,
} from '../../lib/types';
import { AuthTokens, getTokens } from '../../../auth/auth-context';
import { OptionType } from '../../../opening-period/v2/types';

const apiBaseUrl: string = window.ENV?.API_URL || 'http://localhost:8000';

const resourceBasePath = '/resource';
const datePeriodBasePath = '/date_period';
const authRequiredTest = '/auth_required_test';
const invalidateAuthPath = '/invalidate_signature';

interface RequestParameters {
  [key: string]:
    | string
    | number
    | boolean
    | ReadonlyArray<string>
    | ReadonlyArray<number>
    | ReadonlyArray<boolean>
    | undefined
    | LanguageStrings
    | TimeSpanGroup[]
    | ResourceState
    | null;
}

interface GetParameters {
  path: string;
  headers?: { [key: string]: string };
  parameters?: RequestParameters;
}

interface DataRequestParameters {
  path: string;
  headers?: { [key: string]: string };
  data?: RequestParameters;
}

interface OptionsParameters {
  path: string;
}

interface PostParameters extends DataRequestParameters {
  useRootPath?: boolean;
  parameters?: RequestParameters;
}

type PutRequestParameters = DataRequestParameters;

enum ApiResponseFormat {
  json = 'json',
}

interface ApiParameters extends RequestParameters {
  format: ApiResponseFormat;
}

const convertApiChoiceToTranslatedApiChoice = (
  apiChoice: ApiChoice
): TranslatedApiChoice => {
  if (typeof apiChoice.display_name === 'string') {
    return {
      value: apiChoice.value,
      label: {
        fi: apiChoice.display_name,
        sv: null,
        en: null,
      },
    };
  }
  return {
    value: apiChoice.value,
    label: {
      fi: apiChoice.display_name.fi,
      sv: apiChoice.display_name.sv,
      en: apiChoice.display_name.en,
    },
  };
};

const addTokensToRequestConfig = (
  authTokens: AuthTokens,
  config: AxiosRequestConfig
): AxiosRequestConfig => {
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `haukisigned ${querystring.stringify(
        (authTokens as unknown) as ParsedUrlQueryInput
      )}`,
    },
  };
};

async function request<T>(requestConfig: AxiosRequestConfig): Promise<T> {
  const authTokens: AuthTokens | undefined = getTokens();
  const config: AxiosRequestConfig = authTokens
    ? addTokensToRequestConfig(authTokens, requestConfig)
    : requestConfig;

  const response: AxiosResponse<T> = await axios.request<T, AxiosResponse<T>>(
    config
  );
  return response.data;
}

async function apiGet<T>({ path, parameters = {} }: GetParameters): Promise<T> {
  const apiParameters: ApiParameters = {
    ...parameters,
    format: ApiResponseFormat.json,
  };

  return request<T>({
    url: `${apiBaseUrl}/v1${path}/`,
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'get',
    params: apiParameters,
  });
}

const validateStatus = (status: number): boolean => status < 300;

async function apiPost<T>({
  path,
  data = {},
  useRootPath = false,
  parameters,
}: PostParameters): Promise<T> {
  return request<T>({
    url: `${apiBaseUrl}${useRootPath ? '' : '/v1'}${path}/`,
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'post',
    data,
    params: parameters,
    validateStatus,
  });
}

async function apiPatch<T>({
  path,
  data = {},
}: PutRequestParameters): Promise<T> {
  return request<T>({
    url: `${apiBaseUrl}/v1${path}/`,
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'patch',
    data,
    validateStatus,
  });
}

async function apiOptions<T>({ path }: OptionsParameters): Promise<T> {
  return request<T>({
    url: `${apiBaseUrl}/v1${path}/`,
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'options',
    validateStatus(status) {
      return status < 300;
    },
  });
}

async function apiDelete<T>({ path }: GetParameters): Promise<T> {
  return request<T>({
    url: `${apiBaseUrl}/v1${path}/`,
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'delete',
  });
}

interface AuthTestResponse {
  message: string;
  username: string;
}

export interface InvalidateAuthResponse {
  success: boolean;
}

export interface PermissionResponse {
  has_permission: boolean;
}

export default {
  invalidateAuth: async (): Promise<boolean> => {
    const successResponse = await apiPost<InvalidateAuthResponse>({
      path: invalidateAuthPath,
      useRootPath: true,
    });

    return successResponse.success;
  },

  getResource: (id: string): Promise<Resource> =>
    apiGet<Resource>({ path: `${resourceBasePath}/${id}` }),

  getChildResourcesByParentId: (id: number): Promise<Resource[]> =>
    apiGet<{ results: Resource[] }>({
      path: `${resourceBasePath}`,
      parameters: {
        parent: id,
      },
    }).then((response) => response.results),

  getParentResourcesByChildId: (id: number): Promise<Resource[]> =>
    apiGet<{ results: Resource[] }>({
      path: `${resourceBasePath}`,
      parameters: {
        child: id,
      },
    }).then((response) => response.results),

  getDatePeriods: (resourceId: number): Promise<DatePeriod[]> =>
    apiGet<DatePeriod[]>({
      path: `${datePeriodBasePath}`,
      parameters: { resource: resourceId, end_date_gte: '-1d' },
    }),

  getDatePeriod: (datePeriodId: number): Promise<DatePeriod> =>
    apiGet<DatePeriod>({
      path: `${datePeriodBasePath}/${datePeriodId}`,
    }),

  getDatePeriodFormConfig: async (): Promise<UiDatePeriodConfig> => {
    const response = await apiOptions<DatePeriodOptions>({
      path: `${datePeriodBasePath}`,
    });

    const configResponse = response.actions.POST;

    const resourceStateChoices = configResponse.resource_state.choices;

    const resourceStateOptions: TranslatedApiChoice[] = resourceStateChoices.map(
      convertApiChoiceToTranslatedApiChoice
    );

    const timeSpanGroupOptions =
      configResponse.time_span_groups.child.children.rules.child.children;

    const ruleContextOptions: TranslatedApiChoice[] = timeSpanGroupOptions.context.choices.map(
      convertApiChoiceToTranslatedApiChoice
    );

    const ruleSubjectOptions: TranslatedApiChoice[] = timeSpanGroupOptions.subject.choices.map(
      convertApiChoiceToTranslatedApiChoice
    );

    const ruleFrequencyModifierOptions: TranslatedApiChoice[] = timeSpanGroupOptions.frequency_modifier.choices.map(
      convertApiChoiceToTranslatedApiChoice
    );

    return {
      name: configResponse.name,
      resourceState: {
        options: resourceStateOptions,
      },
      timeSpanGroup: {
        rule: {
          context: {
            options: ruleContextOptions,
            required: timeSpanGroupOptions.context.required,
          },
          subject: {
            options: ruleSubjectOptions,
            required: timeSpanGroupOptions.subject.required,
          },
          frequencyModifier: {
            options: ruleFrequencyModifierOptions,
            required: timeSpanGroupOptions.frequency_modifier.required,
          },
          start: {
            required: timeSpanGroupOptions.start.required,
          },
        },
      },
    };
  },

  postDatePeriod: (datePeriod: DatePeriod): Promise<DatePeriod> =>
    apiPost<DatePeriod>({
      path: `${datePeriodBasePath}`,
      data: datePeriod,
    }),

  patchDatePeriod: (datePeriod: DatePeriod): Promise<DatePeriod> =>
    apiPatch<DatePeriod>({
      path: `${datePeriodBasePath}/${datePeriod.id}`,
      data: datePeriod,
    }),

  deleteDatePeriod: (id: number): Promise<{ success: boolean }> =>
    apiDelete<{ success: boolean }>({
      path: `${datePeriodBasePath}/${id}`,
    }),

  testAuth: (): Promise<AuthTestResponse> =>
    apiGet<AuthTestResponse>({
      path: authRequiredTest,
    }),

  testResourcePostPermission: async (resourceId: string): Promise<boolean> => {
    const permission = await apiPost<PermissionResponse>({
      path: `${resourceBasePath}/${resourceId}/permission_check`,
    });
    return permission.has_permission;
  },

  copyDatePeriods: async (
    resourceId: number,
    targetResources: string[]
  ): Promise<boolean> => {
    const permission = await apiPost<PermissionResponse>({
      path: `${resourceBasePath}/${resourceId}/copy_date_periods`,
      parameters: {
        replace: true,
        target_resources: targetResources.join(','),
      },
    });
    return permission.has_permission;
  },
};

export const apiChoiceToOption = (language: Language) => <T>(
  apiTranslation: TranslatedApiChoice<T>
): OptionType<T> => ({
  value: apiTranslation.value,
  label: apiTranslation.label[language],
});
