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
let GRAPHIC_DATA = [ {data: []} ];

export default function AppWebsiteVisits({ device, llave }) {
  let titleGraphic = `Sensor de ${device.grupo.toLowerCase()}`;
  let subtitleGraphic = `Medida de ${device.grupo.toLowerCase()} en ${device.unidad_medida.toLowerCase()}`;

  if(!isNull(getToken()) ) { 
    if(typeof websocket === 'string') { 
      websocket =  new WebSocket(wsRoute + '?Auth=' + getToken());
    }

    websocket.addEventListener('open', () => {
      console.log('Websocket is connected');
  
      const data = {
        action: 'listenDevice',
        deviceId: device.deviceId,
        dataHistory: 'true',
        timeHistory: '24'
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
  if(!isNull(getToken()) ) { 
    websocket.addEventListener('message', (e) => {
      console.log('Message received', JSON.parse(e.data));
      const response = JSON.parse(e.data);



      if(response.hasOwnProperty('message')) {
        const { devices } = response;
        for(let item of devices) { 
          if(item.deviceId == device.deviceId) {
            const value = Number(item.v1);

            GRAPHIC_DATA[0].data.push(value)
            LABEL_DATA.push(item.ts)
          }
        }
      } else { 
        if(response.deviceId == device.deviceId) {
          const value = Number(response.v1);

          GRAPHIC_DATA[0].data.push(value)

          LABEL_DATA.push(response.ts)
        }
      }


      setData(() => [...GRAPHIC_DATA] );
    });
  }
  }, []);

  const chartOptions = merge(BaseOptionChart(), {
    chart: { animations: { enabled: false } },
    plotOptions: { bar: { columnWidth: '11%', borderRadius: 4 } },
    fill: { type: ['solid', 'gradient', 'solid'] },
    labels: LABEL_DATA,
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (y) => {
          if (typeof y !== 'undefined') {
            let abrev = '';
            switch(device.grupo.toLowerCase()) {
              case 'temperatura':
                abrev = '°C';
              break;
              case 'co2':
                abrev = 'PPM';
              break;
              default:
                abrev = '~';
            }
            return `${y.toFixed(0)} ${abrev}`;
          }
          return y;
        }
      }
    }
  });

  return (
    <Card>
      <CardHeader title={titleGraphic} subheader={subtitleGraphic} />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <ReactApexChart type="line" series={data} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
}
