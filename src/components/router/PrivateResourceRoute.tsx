import React, { ReactNode, useEffect, useState } from 'react';
import {
  Route,
  Redirect,
  RouteProps,
  RouteComponentProps,
  useLocation,
  useHistory,
} from 'react-router-dom';
import { AuthContextProps, useAuth } from '../../auth/auth-context';
import api from '../../common/utils/api/api';
import Main from '../main/Main';

const PermissionResolver = ({
  id,
  children,
}: {
  id?: string;
  children?: ReactNode;
}): JSX.Element => {
  const { authTokens, clearAuth }: Partial<AuthContextProps> = useAuth();
  const { pathname, search } = useLocation();
  const history = useHistory();
  const isAuthenticated = !!authTokens;
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    if (!id || !isAuthenticated) {
      setLoading(false);
    } else {
      api
        .testResourcePostPermission(id)
        .then((hasPermission: boolean) => {
          setIsAuthorized(hasPermission);
          setLoading(false);
        })
        .catch((e) => {
          if (clearAuth) {
            clearAuth();
          }
          if (e.response?.status === 404) {
            return history.push(
              `/not_found?original_request=${pathname}${search}`
            );
          }
          return setLoading(false);
        });
    }
  }, [clearAuth, history, id, isAuthenticated, pathname, search]);

  if (isLoading) {
    return (
      <Main id="main">
        <h1>Sivua alustetaan..</h1>
      </Main>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to={{ pathname: '/unauthenticated', search }} />;
  }

  if (!isAuthorized) {
    return <Redirect to={{ pathname: '/unauthorized', search }} />;
  }

  return <>{children}</>;
};

type ComputedMatch = {
  params: {
    id?: string;
  };
};

interface PrivateRouteProps extends RouteProps {
  computedMatch?: ComputedMatch;
  id: string;
}

export default function (routeProps: PrivateRouteProps): JSX.Element {
  const { render, ...rest } = routeProps;

  return (
    <Route
      {...rest}
      render={(
        props: RouteComponentProps<{ id: string }>
      ): JSX.Element | ReactNode => {
        if (!render) {
          // eslint-disable-next-line no-console
          console.error(
            'Missing required render prop from PrivateResourceRoute-attributes'
          );
          return <Redirect to="/" />;
        }

        return (
          <PermissionResolver
            key={props.location.key}
            id={props.match.params.id}>
            {render(props)}
          </PermissionResolver>
        );
      }}
    />
  );
}
