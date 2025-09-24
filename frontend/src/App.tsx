import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { Spinner } from './components/shared/Spinner';
import { AuthRoute, PrivateRoute } from './Route';
import authService from './services/AuthService';
import useAuth from './store/authStore';

const Contents = lazy(() => import('./pages/Contents'));
const Courses = lazy(() => import('./pages/Courses'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Users = lazy(() => import('./pages/Users'));

export default function App() {
  const { authenticatedUser, setAuthenticatedUser } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        if (!authenticatedUser) {
          const authResponse = await authService.refresh();
          if (isMounted) setAuthenticatedUser(authResponse.user ?? null);
        }
      } catch {
        if (isMounted) setAuthenticatedUser(null);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [authenticatedUser, setAuthenticatedUser]);

  if (!isLoaded) return <Spinner />;

  return (
    <Router>
      <Suspense fallback={<Spinner />}>
        <Switch>
          <PrivateRoute exact path="/" component={Dashboard} />
          <PrivateRoute
            exact
            path="/users"
            component={Users}
            roles={['admin']}
          />
          <PrivateRoute exact path="/courses" component={Courses} />
          <PrivateRoute exact path="/courses/:id" component={Contents} />
          <AuthRoute exact path="/login" component={Login} />

          <Route
            render={({ history, location }) => {
              if (location.pathname !== '/login') history.replace('/login');
              return null;
            }}
          />
        </Switch>
      </Suspense>
    </Router>
  );
}
