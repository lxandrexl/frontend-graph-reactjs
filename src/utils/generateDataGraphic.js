import * as moment from 'moment-timezone';
import 'moment/locale/es';

export const mesesSpanish = [
    'Enero', 'Febrero', 'Marzo', 'Abril',
    'Mayo', 'Junio', 'Julio', 'Agosto',
    'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const diasSpanish = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles',
    'Jueves', 'Viernes', 'Sábado'
];

moment.locale('es', {
    months: mesesSpanish,
    monthsShort: 'Enero._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dec.'.split('_'),
    weekdays: diasSpanish,
    weekdaysShort: 'Dom._Lun._Mar._Mier._Jue._Vier._Sab.'.split('_'),
    weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sa'.split('_')
  }
);

export function generateSeries(datos){ 

  console.log("Cantidad de puntos => ",datos.deviceData.length)

  var seriesDaily = [[],[],[]];

  for(let value of datos.deviceData) {
      if(value.deviceId === datos.deviceId) {
          
          seriesDaily[0].push({
            "date": moment(value.ts).format('YYYY-MM-DD HH:mm:ss'),
            "value": parseFloat(value.v1)
          });

          if(datos.rule.activoUmbralMaximo){
              seriesDaily[1].push({
                "date": moment(value.ts).format('YYYY-MM-DD HH:mm:ss'),
                "value": parseFloat(Number(datos.rule.umbralMaximo))
              })
          }
          if(datos.rule.activoUmbralMinimo){
              seriesDaily[2].push({
                "date": moment(value.ts).format('YYYY-MM-DD HH:mm:ss'),
                "value": parseFloat(Number(datos.rule.umbralMinimo))
              })
          }  
      }
      
  }  

  return seriesDaily;
}

