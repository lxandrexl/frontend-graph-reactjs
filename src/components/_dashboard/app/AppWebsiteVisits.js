import { useEffect, useState } from 'react';
import { isNull, merge } from 'lodash';
import ReactApexChart from 'react-apexcharts';
// material
import { Card, CardHeader, Box } from '@material-ui/core';
//
import { BaseOptionChart } from '../../charts';

import { getToken } from 'src/services/tokens';
import { wsRoute } from 'src/services/constants';
// ----------------------------------------------------------------------


let websocket = !isNull(getToken()) ? new WebSocket(wsRoute + '?Auth=' + getToken()) : '';

let LABEL_DATA = [];

let CHART_DATA = [
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

export default function AppWebsiteVisits() {

  if(!isNull(getToken())) { 
    if(typeof websocket === 'string') { 
      console.log('GETTOKEN', getToken());
      websocket =  new WebSocket(wsRoute + '?Auth=' + getToken());
    }

    websocket.addEventListener('open', () => {
      console.log('Websocket is connected');
  
      const data = {
        action: 'listenDevice',
        deviceId: '353438060068088#1#2#LAIVE',
        dataHistory: 'true',
        timeHistory: '12'
      }
  
      websocket.send(JSON.stringify(data));
    });

    websocket.addEventListener('close', () => {
      console.log('Websocket is closed');
    });
  
    websocket.addEventListener('error', (e) => console.log('Websocket is in error', e));
  
  }

  const [data, setData] = useState([]);

  useEffect(() => {
    websocket.addEventListener('message', (e) => {
      console.log('Message received', JSON.parse(e.data));
      const response = JSON.parse(e.data);


      if(response.hasOwnProperty('message')) {
        const { devices } = response;
        for(let item of devices) { 
          const value = Number(item.v1);

          CHART_DATA[0].data.push(value)
          CHART_DATA[1].data.push(value + 11)
          CHART_DATA[2].data.push(value + 33)
          CHART_DATA[3].data.push(value + 44)
          LABEL_DATA.push(item.ts)
        }
      } else { 
        const value = Number(response.v1);

          CHART_DATA[0].data.push(value)
          CHART_DATA[1].data.push(value + 11)
          CHART_DATA[2].data.push(value + 33)
          CHART_DATA[3].data.push(value + 44)
          LABEL_DATA.push(response.ts)
      }

      setData(() => [...CHART_DATA] );
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
