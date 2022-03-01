import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardApp from './pages/DashboardApp';
import NotFound from './pages/Page404';
import { getToken } from './services/tokens';
import { isNull } from 'lodash';
import Stats from './pages/stats/Stats';
import Notifi from './pages/notificaciones/notifis';
import Devices from './pages/devices/devices'
import GraphicDevice  from './pages/devices/graphics/graphic'
import ExportPage from './pages/export'
import ThresholdPage from './pages/threshold'

// ----------------------------------------------------------------------

export default function Router() {
  const authToken = getToken();

  let routesDefault = [
    { path: '/', element: <Navigate to="/login" replace /> },
    { path: 'login', element: <Login /> },
    { path: 'register', element: <Register /> },
    { path: '404', element: <NotFound /> },
    { path: 'dashboard', element: <Navigate to="/login" replace /> },
    { path: '*', element: <Navigate to="/404" /> }
  ];

  let routesAuth = [
    { path: '/', element: <Navigate to="/dashboard/app" replace /> },
    { path: 'login', element: <Navigate to="/dashboard/app" replace /> },
    { path: 'devices', element: <Devices /> },
    { path: 'graphic', element: <GraphicDevice /> },
    { path: 'stats', element: <Stats /> },
    { path: 'notificaciones', element: <Notifi /> },
    { path: 'register', element: <Navigate to="/dashboard/app" replace /> },
    { path: '404', element: <NotFound /> },
  ];

  let dashboardDefault = [{ path: 'app', element: <Navigate to="/login" replace /> }];

  let dashboardAuth = [
    { path: 'app', element: <Devices /> },
    { path: 'all-graphics', element: <DashboardApp /> },
    { path: 'stats', element: <Stats /> },
    { path: 'notificaciones', element: <Notifi /> },
    { path: 'dispositivos', element: <Devices /> },
    { path: 'graphic', element: <GraphicDevice /> },
    { path: 'data', element: <ExportPage/> },
    { path: 'threshold', element: <ThresholdPage/> },
  ];

  let routes = routesDefault;
  let dashboard = dashboardDefault;

  if (!isNull(authToken)) {
    routes = routesAuth;
    dashboard = dashboardAuth;
  }

  return useRoutes([
    {
      path: '/',
      element: <LogoOnlyLayout />,
      children: routes
    },

    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: dashboard
    },

    { path: '*', element: <Navigate to="/404" replace /> }
  ]);
}
