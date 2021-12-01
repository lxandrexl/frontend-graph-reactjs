import { Icon } from '@iconify/react';
import pieChart2Fill from '@iconify/icons-eva/pie-chart-2-fill';

// ----------------------------------------------------------------------

const getIcon = (name) => <Icon icon={name} width={22} height={22} />;

const sidebarConfig = [
  {
    title: 'dashboard',
    path: '/dashboard/app',
    icon: getIcon(pieChart2Fill)
  },
  {
    title: 'graficos',
    path: '/dashboard/all-graphics',
    icon: getIcon(pieChart2Fill)
  },
  {
    title: 'estadisticas',
    path: '/dashboard/stats',
    icon: getIcon(pieChart2Fill)
  },
  {
    title: 'notificaciones',
    path: '/dashboard/notificaciones',
    icon: getIcon(pieChart2Fill)
  }
];

export default sidebarConfig;
