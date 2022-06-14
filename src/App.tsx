import React, { ReactElement, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  RouteComponentProps,
} from 'react-router-dom';
import 'hds-core';
import { AppContext } from './App-context';
import urlUtils, { SearchParameters } from './common/utils/url/url';
import {
  AuthContext,
  AuthTokens,
  getTokens,
  parseAuthParams,
  removeTokens,
  storeTokens,
} from './auth/auth-context';
import Main from './components/main/Main';
import NavigationAndFooterWrapper from './components/navigation-and-footer-wrapper/NavigationAndFooterWrapper';
import HaukiNavigation from './components/navigation/HaukiNavigation';
import './App.scss';
import PrivateResourceRoute from './resource/PrivateResourceRoute';
import ResourcePage from './resource/page/ResourcePage';
import CreateNewOpeningPeriodPage from './opening-period/v2/pages/CreateNewOpeningPeriodPage';
import EditOpeningPeriodPage from './opening-period/v2/pages/EditOpeningPeriodPage';
import { Language } from './common/lib/types';

type OptionalAuthTokens = AuthTokens | undefined;

const getPersistentTokens = (): OptionalAuthTokens => {
  const authTokensFromQuery: OptionalAuthTokens = parseAuthParams(
    window.location.search
  );

  if (authTokensFromQuery) {
    storeTokens(authTokensFromQuery);
  }

  return getTokens();
};

export default function App(): JSX.Element {
  const hasOpenerWindow =
    document.referrer && document.referrer !== window.location.href;

  const closeAppWindow = (): void => {
    // A window can only close itself if it has an parent opener.
    if (hasOpenerWindow) {
      window.close();
    }
  };

  const searchParams: SearchParameters = urlUtils.parseSearchParameters(
    window ? window.location.search : ''
  );
  const targetResourcesParameter = 'target_resources';
  const targetResourcesStr: string | undefined = searchParams[
    targetResourcesParameter
  ] as string;

  const [authTokens, setAuthTokens] = useState<AuthTokens | undefined>(
    getPersistentTokens()
  );

  const clearAuth = (): void => {
    setAuthTokens(undefined);
    removeTokens();
  };

  const [language, setLanguage] = useState(Language.FI);

  return (
    <div className="App">
      <AppContext.Provider
        value={{ hasOpenerWindow, closeAppWindow, language, setLanguage }}>
        <AuthContext.Provider value={{ authTokens, clearAuth }}>
          <Router>
            <Switch>
              <Route exact path="/">
                <NavigationAndFooterWrapper>
                  <Main id="main">
                    <h1>Etusivu</h1>
                  </Main>
                </NavigationAndFooterWrapper>
              </Route>
              <Route exact path="/not_found">
                <NavigationAndFooterWrapper>
                  <Main id="main">
                    <h1>Kohdetta ei löydy</h1>
                    <p>
                      Kohdetta ei löytynyt. Yritä myöhemmin uudestaan. Ongelman
                      toistuessa ota yhteys sivuston ylläpitoon. Teidät on
                      automaattisesti kirjattu ulos.
                    </p>
                  </Main>
                </NavigationAndFooterWrapper>
              </Route>
              <Route exact path="/unauthorized">
                <NavigationAndFooterWrapper>
                  <Main id="main">
                    <h1>Puutteelliset tunnukset</h1>
                  </Main>
                </NavigationAndFooterWrapper>
              </Route>
              <Route exact path="/unauthenticated">
                <NavigationAndFooterWrapper>
                  <Main id="main">
                    <h1>Puuttuvat tunnukset</h1>
                  </Main>
                </NavigationAndFooterWrapper>
              </Route>
              <PrivateResourceRoute
                id="resource-route"
                exact
                path="/resource/:id"
                render={({
                  match,
                }: RouteComponentProps<{ id: string }>): ReactElement => (
                  <NavigationAndFooterWrapper>
                    <Main id="main">
                      <ResourcePage
                        id={match.params.id}
                        targetResourcesString={targetResourcesStr}
                      />
                    </Main>
                  </NavigationAndFooterWrapper>
                )}
              />
              <PrivateResourceRoute
                id="create-new-opening-period-route"
                exact
                path="/resource/:id/period/new"
                render={({
                  match,
                }: RouteComponentProps<{
                  id: string;
                }>): ReactElement => (
                  <>
                    <HaukiNavigation />
                    <Main id="main">
                      <CreateNewOpeningPeriodPage
                        resourceId={match.params.id}
                      />
                    </Main>
                  </>
                )}
              />
              <PrivateResourceRoute
                id="create-new-opening-period-route"
                exact
                path="/resource/:id/period/new-exception"
                render={({
                  match,
                }: RouteComponentProps<{
                  id: string;
                }>): ReactElement => (
                  <>
                    <HaukiNavigation />
                    <Main id="main">
                      <CreateNewOpeningPeriodPage
                        resourceId={match.params.id}
                      />
                    </Main>
                  </>
                )}
              />
              <PrivateResourceRoute
                id="edit-opening-period-route"
                path="/resource/:id/period/:datePeriodId"
                render={({
                  match,
                }: RouteComponentProps<{
                  id: string;
                  datePeriodId: string;
                }>): ReactElement => (
                  <>
                    <HaukiNavigation />
                    <Main id="main">
                      <EditOpeningPeriodPage
                        resourceId={match.params.id}
                        datePeriodId={match.params.datePeriodId}
                      />
                    </Main>
                  </>
                )}
              />
            </Switch>
          </Router>
        </AuthContext.Provider>
      </AppContext.Provider>
    </div>
  );
}
