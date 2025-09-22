import { Redirect, Route, RouteProps } from 'react-router';

import useAuth from './store/userStore';

export { Route } from 'react-router';

interface PrivateRouteProps extends RouteProps {
  roles?: string[];
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
          if (roles) {
            if (roles.includes(authenticatedUser.role)) {
              return <Component {...props} />;
            } else {
              return <Redirect to="/" />;
            }
          } else {
            return <Component {...props} />;
          }
        }
        return <Redirect to="/login" />;
      }}
    />
  );
}

export function AuthRoute({ component: Component, ...rest }) {
  const { authenticatedUser } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        return authenticatedUser ? (
          <Redirect to="/" />
        ) : (
          <Component {...props} />
        );
      }}
    />
  );
}
