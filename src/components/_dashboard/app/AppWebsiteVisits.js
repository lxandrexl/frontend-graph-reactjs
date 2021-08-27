import { useEffect, useState } from 'react';
import { merge } from 'lodash';
import ReactApexChart from 'react-apexcharts';
// material
import { Card, CardHeader, Box } from '@material-ui/core';
//
import { BaseOptionChart } from '../../charts';

import { webSockets, ws } from '../../../services/sensorTemp';
// ----------------------------------------------------------------------

const LABEL_DATA = ['01/01/2003 16:14:00'];

webSockets();

export default function AppWebsiteVisits() {
  const CHART_DATA = [
    {
      name: 'Dispositivo 01',
      type: 'column',
      data: []
    },
    {
      name: 'Dispositivo 02',
      type: 'area',
      data: []
    },
    {
      name: 'Dispositivo 03',
      type: 'line',
      data: []
    },
    {
      name: 'Dispositivo 04',
      type: 'line',
      data: []
    }
  ];

  const [data, setData] = useState([]);

  useEffect(() => {
    ws.addEventListener('message', (e) => {
      console.log('Message received', JSON.parse(e.data).message, JSON.parse(e.data).date);
      const response = JSON.parse(e.data);
      const { message, date } = response;

      CHART_DATA[0].data.push(message[0]);
      CHART_DATA[1].data.push(message[1]);
      CHART_DATA[2].data.push(message[2]);
      CHART_DATA[3].data.push(message[3]);

      LABEL_DATA.push(date);

      setData(() => [...CHART_DATA]);
    });
  }, []);

  const chartOptions = merge(BaseOptionChart(), {
    chart: { animations: { enabled: false } },
    stroke: { width: [0, 2, 3, 3] },
    plotOptions: { bar: { columnWidth: '11%', borderRadius: 4 } },
    fill: { type: ['solid', 'gradient', 'solid'] },
    labels: LABEL_DATA,
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (y) => {
          if (typeof y !== 'undefined') {
            return `${y.toFixed(0)} °C`;
          }
          return y;
        }
      }
    }
  });

  return (
    <Card>
      <CardHeader title="Sensor de temperatura" subheader="Medida de temperatura en Celsius (°C)" />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <ReactApexChart type="line" series={data} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
}
