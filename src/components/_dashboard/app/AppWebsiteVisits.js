import { useEffect, useState } from 'react';
import { merge } from 'lodash';
import ReactApexChart from 'react-apexcharts';
// material
import { Card, CardHeader, Box,Button } from '@material-ui/core';
//
import { BaseOptionChart } from '../../charts';

import * as moment from 'moment';
import {getDeviceData} from 'src/services/device.service';
import { getAccessToken } from 'src/services/tokens';
import { timeIntervalPerMinute } from 'src/services/constants'

import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
// ----------------------------------------------------------------------
import Modal from '@material-ui/core/Modal';
import CalendarGraphic from 'src/pages/calendarGraphic'
import { makeStyles } from '@material-ui/styles';
import { useLocation } from 'react-router-dom'
import {
  generateSeries,
  generateOptions,
  mesesSpanish,
  diasSpanish
} from 'src/utils/generateDataGraphic';

moment.locale('es');

const useStyles = makeStyles((theme) => ({    
  paper2:{
    position: 'absolute',    
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    width: 'auto',
    overflow: 'auto',
    height: 'auto',
    display: 'block',
    padding: theme.spacing(2, 4, 3),
  },
}));

export default function AppWebsiteVisits({device, llave, rule,dateGraphic}) {

  const location = useLocation();

  const type = (location.state === null) 
    ? null 
    : location.state.type;

  const deviceLocation = (location.state === null) 
    ? null 
    : location.state.device;

  if(device === undefined || device === null) device = deviceLocation;   

  let titleGraphic = (typeof device !== 'undefined')
    ? `${device.descripcion}`
    : `${deviceLocation.descripcion}`;

  let subtitleGraphic = (typeof device !== 'undefined') 
    ? `Codigo de dispositivo: ${device.deviceId}`
    : `Codigo de dispositivo: ${deviceLocation.deviceId}`;

  const timeInterval = timeIntervalPerMinute;
  const perMinute = 60000;
  let lastTS = (typeof dateGraphic === 'string') ? dateGraphic : "";

  if(rule === undefined || rule === null) rule = []; 

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
    console.log("lastTS =>", lastTS);
    
    let response = await getDeviceData(getAccessToken(), lastTS, timeInterval, device.deviceId);

    if(response.data.length > 0) {
      const deviceData = response.data[0].data;
      lastTS = response.data[0].ts;

      if(typeof dateGraphic !== 'string'){

        for(let value of deviceData) {
          if(value.deviceId === device.deviceId) {        
            
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

      }else{   
        valuesArr = generateSeries({
          deviceData: deviceData,
          rule: rule,
          deviceId : device.deviceId
        });                     
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

  var abrevDaily = '';
      
  switch(device.grupo.toLowerCase()) {
    case 'temperatura':
      abrevDaily = ' °C';
      break;
    case 'co2':
      abrevDaily = ' PPM';
      break;
    default:
      abrevDaily = ' ~';
  }

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
            return `${y.toFixed(0)} ${abrevDaily}`;
          }
          return y;
        }
      }
    }
  });

  let umbralMax = [];
  let umbralMin = [];
  let info =  [ { name: 'Dispositivo', data } ];

  if(typeof dateGraphic !== 'string'){

    for(let dataUmbral of umbral) {
      umbralMax.push(dataUmbral[0]);
      umbralMin.push(dataUmbral[1]);
    }    
    
    if(rule.activoUmbralMaximo) {
      info.push({ name: 'Umbral Maximo', data: umbralMax });
    }

    if(rule.activoUmbralMinimo) {
      info.push({ name: 'Umbral Minimo', data: umbralMin });
    }
  
  }

  console.log('LOG FUERA DEL USE EFFECT')
  
  //-----------------    

  function getModalStyle() {
    const top = 50 ;
    const left = 50 ;
  
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

  const [modalStyle] = useState(getModalStyle);

  const classes = useStyles();

  const modalDailyGraphic = (data) => (
    (
       <div style={modalStyle} className={classes.paper2}>
         <h2 id="simple-modal-title">SELECCIONE EL DIA DEL GRÁFICO</h2>
         <br/>
         <CalendarGraphic datos={data} estado={2} />
       </div>
     )    
   );  

  const [openDailyGraphicModal, setOpenDailyGraphicModal] = useState(false);

  const handleOpenDailyGraphicModal = () => {
    setOpenDailyGraphicModal(true);
  };

  const handleCloseDailyGraphicModal = () => {
    setOpenDailyGraphicModal(false);
  }; 
  
  const options = generateOptions({
    titleGraphic: titleGraphic,
    subtitleGraphic: subtitleGraphic,
    dateGraphic: dateGraphic,
    data: data,
    abrevDaily: abrevDaily
  })    

  Highcharts.setOptions({
    lang: { months: mesesSpanish, weekdays: diasSpanish },
    colors: ['#00ab55','#ffc107','#1890ff']
  });   

  return (    
    (typeof dateGraphic !== 'string') 
      ? (<Card>
        <CardHeader title={titleGraphic} subheader={subtitleGraphic} />
        <Box sx={{ p: 3, pb: 1 }} dir="ltr">
          <ReactApexChart type="line" series={info} options={chartOptions} height={364} />
        </Box>
      </Card>)
      : ( 
          <>
            <Modal
              open={openDailyGraphicModal}
              onClose={handleCloseDailyGraphicModal}
              aria-labelledby="simple-modal-title"
              aria-describedby="simple-modal-description"        
            >
              {modalDailyGraphic({device: device, type: type})}
            </Modal>
            <Box display="flex" justifyContent="flex-end">
              <Button
                style={{ margin: '0 10px 20px 0', position: 'absolute', right:'32px', 'zIndex':'99' }}
                variant="contained"
                color="primary"
                onClick={handleOpenDailyGraphicModal}
              >            
                Cambiar Fecha
              </Button> 
            </Box>      
            <Card>
              <HighchartsReact highcharts={Highcharts} options={options} updateArgs={[true]}/>
            </Card>
          </>           
        )
  );
}
