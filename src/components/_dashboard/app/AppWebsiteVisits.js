import { useEffect, useState, useRef } from 'react';
import { isNull, merge } from 'lodash';
import ReactApexChart from 'react-apexcharts';
// material
import { Card, CardHeader, Box } from '@material-ui/core';
//
import { BaseOptionChart } from '../../charts';

import * as moment from 'moment';
import {getDeviceData} from 'src/services/device.service';
import { getToken } from 'src/services/tokens';
import { timeIntervalPerMinute } from 'src/services/constants'
// ----------------------------------------------------------------------
moment.locale('es');

export default function AppWebsiteVisits({ device, llave, rule }) {
  let titleGraphic = `${device.descripcion}`;
  let subtitleGraphic = `Codigo de dispositivo: ${device.deviceId}`;
  const timeInterval = timeIntervalPerMinute;
  const perMinute = 60000;
  let lastTS = "";

  if(rule == undefined || rule == null) rule = []; 

  const [count, setCount] = useState(0);
  const [data, setData] = useState([]);
  const [labels, setLabel] = useState([]);
  const [umbral, setUmbral] = useState([]);

  useEffect(() => {
    const timer = setInterval(async () => {
      // Logica ...
      setCount(c => c + 1);

    }, timeInterval * perMinute);

    return () => {
      console.log("end timer")
      clearInterval(timer);
    }
  }, []);

  useEffect(async () => {
    let valuesArr = [];
    let labelsArr = [];
    let umbralArr = [];

    console.log(count)
    console.log("lastTS", lastTS);
    
    let response = await getDeviceData(getToken(), lastTS, timeInterval, device.deviceId);

    if(response.data.length > 0) {
      const deviceData = response.data[0].data;
      lastTS = response.data[0].ts;

      for(let value of deviceData) {
        if(value.deviceId == device.deviceId) {
          valuesArr.push(value.v1);
          labelsArr.push(moment(value.ts).format('MMMM Do YYYY, h:mm:ss a'));

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

      console.log(device.deviceId, lastTS, valuesArr);
    }

    setData([
      ...data,
      ...valuesArr
    ]);

    setLabel([
      ...labels,
      ...labelsArr
    ]);

    setUmbral([
      ...umbral,
      ...umbralArr
    ])

  }, [count]);

  useEffect(() => {
    // console.log("Nueva data ->", device.deviceId, data)
  }, [data]);

  const chartOptions = merge(BaseOptionChart(), {
    chart: { animations: { enabled: false } },
    xaxis: { range: 28 },
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
