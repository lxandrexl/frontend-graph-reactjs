import { useEffect, useState, useRef } from 'react';
import { isNull, merge } from 'lodash';
import ReactApexChart from 'react-apexcharts';
// material
import { Card, CardHeader, Box } from '@material-ui/core';
//
import { BaseOptionChart } from '../../charts';

import * as moment from 'moment';
// ----------------------------------------------------------------------
moment.locale('es');

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest function.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

let CHART_DATA = [
  {
    name: 'Team A',
    type: 'column',
    data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30]
  },
  {
    name: 'Team B',
    type: 'area',
    data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43]
  },
  {
    name: 'Team C',
    type: 'line',
    data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39]
  }
];

export default function AppWebsiteVisits({ device, llave, rule }) {
  let titleGraphic = `${device.descripcion}`;
  let subtitleGraphic = `Codigo de dispositivo: ${device.deviceId}`;
  const timeInterval = 1;
  const perMinute = 10000//60000;

  if(rule == undefined || rule == null) rule = []; 

  const [count, setCount] = useState(0);
  const [delay, setDelay] = useState(timeInterval * perMinute);
  const [data, setData] = useState([]);
  const [wsData, setWsData] = useState([]);
  

  useInterval(() => {
    // Your custom logic here
    setCount(count + 1);
    setWsData([
      ...[(count + 1)]
    ]);
  }, delay);

  useEffect(() => {
    setData([
      ...data,
      ...wsData
    ]);
  }, [wsData]);

  if(count == 0) {
    console.log(count, device, rule)
  } else {
    console.log(device.deviceId)
    console.log(data)
  }

  const chartOptions = merge(BaseOptionChart(), {
    stroke: { width: [0, 2, 3] },
    plotOptions: { bar: { columnWidth: '11%', borderRadius: 4 } },
    fill: { type: ['solid', 'gradient', 'solid'] },
    labels: [
      '01/01/2003',
      '02/01/2003',
      '03/01/2003',
      '04/01/2003',
      '05/01/2003',
      '06/01/2003',
      '07/01/2003',
      '08/01/2003',
      '09/01/2003',
      '10/01/2003',
      '11/01/2003'
    ],
    xaxis: { type: 'datetime' },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (y) => {
          if (typeof y !== 'undefined') {
            return `${y.toFixed(0)} visits`;
          }
          return y;
        }
      }
    }
  });



  return (

    <Card>
      <CardHeader title={titleGraphic} subheader={subtitleGraphic + ' ' + count} />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <ReactApexChart type="line" series={CHART_DATA} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
}
