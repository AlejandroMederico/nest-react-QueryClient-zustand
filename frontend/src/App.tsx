import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Loader } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { AuthRoute, PrivateRoute } from './Route';
import { authService } from './services/AuthService';
import useAuth from './store/authStore';

const Contents = lazy(() => import('./pages/Contents'));
const Courses = lazy(() => import('./pages/Courses'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Users = lazy(() => import('./pages/Users'));
const Contact = lazy(() => import('./pages/Contact'));

function App() {
  const { setAuthenticatedUser, setToken, logout } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const { i18n } = useTranslation();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const localToken = localStorage.getItem('token');
        if (localToken) {
          const authResponse = await authService.refresh();
          if (isMounted) {
            setAuthenticatedUser(authResponse.user ?? null);
            setToken(authResponse.token);
          }
        } else {
          if (isMounted) {
            setAuthenticatedUser(null);
            setToken(undefined);
          }
        }
      } catch {
        if (isMounted) {
          setAuthenticatedUser(null);
          setToken(undefined);
          logout();
        }
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [setAuthenticatedUser, setToken, logout]);

  if (!isLoaded) return <Loader className="h-16 w-16 mx-auto" />;

  return (
    <>
      <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 1000 }}>
        <button onClick={() => i18n.changeLanguage('es')}>ES</button>
        <button
          onClick={() => i18n.changeLanguage('en')}
          style={{ marginLeft: 8 }}
        >
          EN
        </button>
      </div>
      <Router>
        <Suspense fallback={<Loader className="h-16 w-16 mx-auto" />}>
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

            <Route exact path="/contact" component={Contact} />
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
    </>
  );
}

export default App;
