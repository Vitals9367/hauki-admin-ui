/// <reference types="node"/>
import querystring, { ParsedUrlQuery } from 'querystring';
import { Context, createContext, useContext } from 'react';
import storage from '../common/utils/storage/storage';

export enum TokenKeys {
  usernameKey = 'hsa_username',
  resourceKey = 'hsa_resource',
  organizationKey = 'hsa_organization',
  signatureKey = 'hsa_signature',
  validUntilKey = 'hsa_valid_until',
  createdAtKey = 'hsa_created_at',
  sourceKey = 'hsa_source',
  hasOrganizationRights = 'hsa_has_organization_rights',
}

export interface AuthTokens {
  [TokenKeys.usernameKey]: string;
  [TokenKeys.resourceKey]: string;
  [TokenKeys.organizationKey]: string;
  [TokenKeys.signatureKey]: string;
  [TokenKeys.validUntilKey]: string;
  [TokenKeys.createdAtKey]: string;
  [TokenKeys.sourceKey]: string;
  [TokenKeys.sourceKey]: string;
  [TokenKeys.hasOrganizationRights]: string;
}

const authKeys = [
  TokenKeys.usernameKey,
  TokenKeys.signatureKey,
  TokenKeys.validUntilKey,
  TokenKeys.createdAtKey,
  TokenKeys.resourceKey,
  TokenKeys.organizationKey,
  TokenKeys.sourceKey,
  TokenKeys.hasOrganizationRights,
];

const tokenStorageKey: 'tokens' = 'tokens' as const;

export const storeTokens = (
  authTokens: AuthTokens | undefined
): AuthTokens | undefined =>
  storage.storeItem<AuthTokens | undefined>({
    key: tokenStorageKey,
    value: authTokens,
  });

export const removeTokens = (): void => storage.removeItem(tokenStorageKey);

export const getTokens = (): AuthTokens | undefined =>
  storage.getItem<AuthTokens | undefined>(tokenStorageKey);

export const parseAuthParams = (queryStr: string): AuthTokens | undefined => {
  const queryParams: ParsedUrlQuery = querystring.parse(
    queryStr.replace('?', '')
  );
  const authParams = authKeys.reduce((acc, key) => {
    const paramValue: string | string[] | undefined = queryParams[key];
    const value = typeof paramValue === 'string' ? paramValue : paramValue?.[0];
    if (value) {
      return { ...acc, [key]: decodeURIComponent(value) };
    }
    return acc;
  }, {});

  if (
    authKeys.sort().toString() === Object.keys(authParams).sort().toString()
  ) {
    return (authParams as unknown) as AuthTokens;
  }

  return undefined;
};

export type AuthContextProps = {
  authTokens: AuthTokens | undefined;
  clearAuth: () => void;
};

export const AuthContext: Context<{}> = createContext({});

export function useAuth(): Partial<AuthContextProps> {
  return useContext(AuthContext);
}
