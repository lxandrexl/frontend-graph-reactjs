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

export default function AppWebsiteVisits({ device, llave }) {
  const [ws] = useState(new WebSocket(wsRoute + '?Auth=' + getToken()));
  const [wsOpen, setWsOpen] = useState(false);
  const [data, setData] = useState([]);
  const [labels, setLabels] = useState([]);

  let titleGraphic = `Sensor de ${device.grupo.toLowerCase()}`;
  let subtitleGraphic = `Medida de ${device.grupo.toLowerCase()} en ${device.unidad_medida.toLowerCase()}`;

  useEffect(() => {
    let websocket = ws;
    if(!isNull(getToken()) ) { 
      websocket.addEventListener('open', () => {
        console.log('Websocket is connected');
    
        const data = {
          action: 'listenDevice',
          deviceId: device.deviceId,
          dataHistory: 'true',
          timeHistory: '24'
        }
    
        websocket.send(JSON.stringify(data));
        setWsOpen(true);
      });
  
      websocket.addEventListener('close', () => {
        console.log('Websocket is closed');
      });
    
      websocket.addEventListener('error', (e) => console.log('Websocket is in error', e));
    }
  }, []);

  useEffect(() => {
    if(!wsOpen) return;
    let websocket = ws;
    if(!isNull(getToken()) ) { 
      websocket.addEventListener('message', (e) => {
        console.log('Message received', JSON.parse(e.data));
        const response = JSON.parse(e.data);
        let valuesArr = [];
        let labelsArr = [];


        if(response.hasOwnProperty('message')) {
          const { devices } = response;
          for(let item of devices) { 
            if(item.deviceId == device.deviceId) {
              const value = Number(item.v1);
              valuesArr.push(value);
              labelsArr.push(item.ts)
            }
          }
        } else { 
          if(response.deviceId == device.deviceId) {
            const value = Number(response.v1);
            valuesArr.push(value);
            labelsArr.push(response.ts)
          }
        }

        setData([
          ...valuesArr
        ]);
        setLabels([
          ...labelsArr
        ]);
      });
    }
  }, [wsOpen]);

  const chartOptions = merge(BaseOptionChart(), {
    chart: { animations: { enabled: false } },
    plotOptions: { bar: { columnWidth: '11%', borderRadius: 4 } },
    fill: { type: ['solid', 'gradient', 'solid'] },
    labels,
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
        <ReactApexChart type="line" series={[{data}]} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
}
