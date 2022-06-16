import React, { ReactElement } from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { act } from 'react-dom/test-utils';
import {
  BrowserRouter as Router,
  Route,
  RouteComponentProps,
} from 'react-router-dom';
import api from '../../common/utils/api/api';
import * as AuthContext from '../../auth/auth-context';
import PrivateResourceRoute from './PrivateResourceRoute';
import { AuthTokens } from '../../auth/auth-context';

const testTokens: AuthTokens = {
  hsa_username: 'admin@hel.fi',
  hsa_created_at: '2020-11-05',
  hsa_valid_until: '2020-11-12',
  hsa_resource: 'tprek:8100',
  hsa_organization: 'abcdefg',
  hsa_signature: '1234567',
  hsa_source: 'tprek',
  hsa_has_organization_rights: 'true',
};

const renderRoutesWithPrivateRoute = (): ReactWrapper => {
  window.history.pushState(
    {},
    'Test page',
    `/resource/${testTokens.hsa_resource}`
  );
  return mount(
    <Router>
      <Route exact path="/not_found">
        <h1>Test not found</h1>
      </Route>
      <Route exact path="/unauthenticated">
        <h1>T pest unauthenticated</h1>
      </Route>
      <Route exact path="/unauthorized">
        <h1>Test unauthorized</h1>
      </Route>
      <PrivateResourceRoute
        id="resource-route"
        exact
        path="/resource/:id"
        render={({
          match,
        }: RouteComponentProps<{ id: string }>): ReactElement => (
          <h1>{match.params.id}</h1>
        )}
      />
    </Router>
  );
};

const mockContext = (
  { tokens }: { tokens: Partial<AuthContext.AuthTokens> | undefined } = {
    tokens: testTokens,
  }
): void => {
  jest.spyOn(AuthContext, 'useAuth').mockImplementation(
    () =>
      (({
        authTokens: tokens,
        clearTokens: (): void => undefined,
      } as unknown) as Partial<AuthContext.AuthContextProps>)
  );
};

const mockPermissionsApi = (hasPermission: boolean): void => {
  jest
    .spyOn(api, 'testResourcePostPermission')
    .mockImplementation(() => Promise.resolve(hasPermission));
};

describe(`<PrivateResourceRoute />`, () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading indicator', async () => {
    mockContext();
    mockPermissionsApi(true);

    const renderedComponent = renderRoutesWithPrivateRoute();

    await act(async () => {
      renderedComponent.update();
    });

    expect(renderedComponent.find('h1').text()).toEqual('Sivua alustetaan..');
  });

  it('should show content', async () => {
    mockContext();
    mockPermissionsApi(true);

    const renderedComponent = renderRoutesWithPrivateRoute();

    await act(async () => {
      renderedComponent.update();
    });

    await act(async () => {
      renderedComponent.update();
    });

    expect(renderedComponent.find('h1').text()).toEqual(
      testTokens.hsa_resource
    );
  });

  it('should redirect to /unauthorized', async () => {
    mockContext();
    mockPermissionsApi(false);

    const renderedComponent = renderRoutesWithPrivateRoute();

    await act(async () => {
      renderedComponent.update();
    });

    await act(async () => {
      renderedComponent.update();
    });

    expect(renderedComponent.find('h1').text()).toEqual('Test unauthorized');
  });

  it('should redirect to /unauthenticated', async () => {
    mockContext({ tokens: undefined });
    mockPermissionsApi(false);

    const renderedComponent = renderRoutesWithPrivateRoute();

    await act(async () => {
      renderedComponent.update();
    });

    await act(async () => {
      renderedComponent.update();
    });

    expect(renderedComponent.find('h1').text()).toEqual('Test unauthenticated');
  });

  it('should redirect to /not_found', async () => {
    mockContext();

    const resourceNotFoundError = {
      response: {
        status: 404,
      },
    };

    jest
      .spyOn(api, 'testResourcePostPermission')
      .mockImplementation(() => Promise.reject(resourceNotFoundError));

    const renderedComponent = renderRoutesWithPrivateRoute();

    await act(async () => {
      renderedComponent.update();
    });

    await act(async () => {
      renderedComponent.update();
    });

    expect(renderedComponent.find('h1').text()).toEqual('Test not found');
  });
});
