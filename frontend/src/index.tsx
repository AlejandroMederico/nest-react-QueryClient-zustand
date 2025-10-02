import './styles/index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import App from './App';
import reportWebVitals from './reportWebVitals';

// ✅ Cliente con defaults globales (sin polling, sin refetch al foco)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 60s de "frescura" (NO genera tráfico solo)
      refetchInterval: false, // sin polling
      refetchOnWindowFocus: false, // no re-fetch al volver a la pestaña
      refetchOnReconnect: false, // no re-fetch al reconectar
      retry: 1, // opcional, menos agresivo
    },
    mutations: {
      retry: 0,
    },
  },
});

// Devtools solo en desarrollo (v3)
const Devtools = React.lazy(() =>
  import('react-query/devtools').then((m) => ({
    default: m.ReactQueryDevtools,
  })),
);

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {process.env.NODE_ENV === 'development' && (
        <React.Suspense fallback={null}>
          <Devtools initialIsOpen={false} />
        </React.Suspense>
      )}
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

reportWebVitals();
