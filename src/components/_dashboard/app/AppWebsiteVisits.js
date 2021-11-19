import { useEffect, useState } from 'react';
import { isNull, merge } from 'lodash';
import ReactApexChart from 'react-apexcharts';
// material
import { Card, CardHeader, Box } from '@material-ui/core';
//
import { BaseOptionChart } from '../../charts';

import { getToken } from 'src/services/tokens';
import { wsRoute } from 'src/services/constants';
import * as moment from 'moment';
// ----------------------------------------------------------------------
moment.locale('es');

export default function AppWebsiteVisits({ device, llave, rule }) {
  const [ws, setWs] = useState(null);

  const [data, setData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [umbral, setUmbral] = useState([]);

  const [wsData, setWsData] = useState([]);
  const [wsLabels, setWsLabels] = useState([]);
  const [wsUmbral, setWsUmbral] = useState([]);

  let titleGraphic = `${device.descripcion}`;
  let subtitleGraphic = `Codigo de dispositivo: ${device.deviceId}`;

  if(rule == undefined || rule == null) rule = []; 

  useEffect(() => {
    if(!isNull(getToken()) ) {
      const websocket = new WebSocket(wsRoute + '?Auth=' + getToken());
      websocket.addEventListener('open', () => {
        console.log('Websocket is connected -->', device.deviceId);
    
        const payload = {
          action: 'listenDevice',
          deviceId: device.deviceId,
          dataHistory: 'true',
          timeHistory: '1'
        }
    
        websocket.send(JSON.stringify(payload));
      });
  
      websocket.addEventListener('close', () => {
        console.log('Websocket is closed --->', device.deviceId);
      });
    
      websocket.addEventListener('error', (e) => console.log('Websocket is in error', e));
      setWs(websocket);
      return () => {
        websocket.close();
      }
    }
  }, []);

  useEffect(() => {
    if(!ws) return;
    let websocket = ws;
    if(!isNull(getToken()) ) { 
      websocket.addEventListener('message', (e) => {
        console.log('Message received', JSON.parse(e.data));
        const response = JSON.parse(e.data);
        let valuesArr = [];
        let labelsArr = [];
        let umbralArr = [];


        if(response.hasOwnProperty('message')) {
          const { devices } = response;
          for(let item of devices) { 
            if(item.deviceId == device.deviceId) {
              const value = Number(item.v1);
              valuesArr.push(value);
              labelsArr.push(moment(item.ts).format('MMMM Do YYYY, h:mm:ss a'));

              //Verifico si existe umbral maximo/minimo activo.
              let umbralPos = [null,null];

              if(rule.activoUmbralMaximo) {
                umbralPos[0] = Number(rule.umbralMaximo);
              }

              if(rule.activoUmbralMinimo) {
                umbralPos[1] = Number(rule.umbralMinimo);
              }

              umbralArr.push(umbralPos);
            }
          }
        } else { 
          if(response.deviceId == device.deviceId) {
            const value = Number(response.v1);
            valuesArr.push(value);
            labelsArr.push(moment(response.ts).format('MMMM Do YYYY, h:mm:ss a'))

            //Verifico si existe umbral maximo/minimo activo.
            let umbralPos = [null,null];

            if(rule.activoUmbralMaximo) {
              umbralPos[0] = Number(rule.umbralMaximo);
            }

            if(rule.activoUmbralMinimo) {
              umbralPos[1] = Number(rule.umbralMinimo);
            }
            
            umbralArr.push(umbralPos);
          }
        }

        setWsData([
          ...valuesArr
        ]);
        setWsLabels([
          ...labelsArr
        ]);
        setWsUmbral([
          ...umbralArr
        ])
      });
    }
  }, [ws]);

  // return (<></>);

  useEffect(() => {
    setData([
      ...data,
      ...wsData
    ]);
  }, [wsData]);

  useEffect(() => {
    setLabels([
      ...labels,
      ...wsLabels
    ]);
  }, [wsLabels]);

  useEffect(() => {
    setUmbral([
      ...umbral,
      ...wsUmbral
    ]);
  }, [wsUmbral])

  const chartOptions = merge(BaseOptionChart(), {
    chart: { animations: { enabled: false } },
    plotOptions: { bar: { columnWidth: '11%', borderRadius: 4 } },
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

  let umbralMax = [];
  let umbralMin = [];

  for(let dataUmbral of umbral) {
    umbralMax.push(dataUmbral[0]);
    umbralMin.push(dataUmbral[1]);
  }

  let info =  [ { name: 'Dispositivo', data } ];
  
  if(rule.activoUmbralMaximo) {
    info.push({ name: 'Umbral Maximo', data: umbralMax });
  }

  if(rule.activoUmbralMinimo) {
    info.push({ name: 'Umbral Minimo', data: umbralMin });
  }

  return (
    <Card>
      <CardHeader title={titleGraphic} subheader={subtitleGraphic} />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <ReactApexChart type="line" series={info} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
}
