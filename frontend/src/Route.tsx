import React from 'react';
import { Route, RouteProps } from 'react-router-dom';

import useAuth from './store/authStore';

type Role = 'admin' | 'editor' | 'user';

interface PrivateRouteProps
  extends Omit<RouteProps, 'component' | 'render' | 'children'> {
  component: React.ElementType;
  roles?: Role[];
}

export function PrivateRoute({
  component: Component,
  roles,
  ...rest
}: PrivateRouteProps) {
  const { authenticatedUser } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (authenticatedUser) {
          if (!roles || roles.includes(authenticatedUser.role as Role)) {
            return <Component {...props} />;
          }
          // No autorizado -> redirigir sin <Redirect/>
          props.history.replace('/');
          return null;
        }
        // No autenticado -> al login
        props.history.replace('/login');
        return null;
      }}
    />
  );
}

interface AuthRouteProps
  extends Omit<RouteProps, 'component' | 'render' | 'children'> {
  component: React.ElementType;
}

export function AuthRoute({ component: Component, ...rest }: AuthRouteProps) {
  const { authenticatedUser } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (authenticatedUser) {
          props.history.replace('/');
          return null;
        }
        return <Component {...props} />;
      }}
    />
  );
}
