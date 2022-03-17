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
            
            const fechaUTC = Date.UTC(
                parseInt(moment(value.ts).format('YYYY')),
                parseInt(moment(value.ts).format('M'))-1,
                parseInt(moment(value.ts).format('D')),
                parseInt(moment(value.ts).format('H')),
                parseInt(moment(value.ts).format('m')),
                parseInt(moment(value.ts).format('s'))
            );

            seriesDaily[0].push([fechaUTC,parseFloat(value.v1)]);

            if(datos.rule.activoUmbralMaximo){
                seriesDaily[1].push([fechaUTC,parseFloat(Number(datos.rule.umbralMaximo))])
            }
            if(datos.rule.activoUmbralMinimo){
                seriesDaily[2].push([fechaUTC,parseFloat(Number(datos.rule.umbralMinimo))])
            }  
        }
        
    }   

    return seriesDaily;
}

export function generateOptions(datos){
    const textoFecha = moment(datos.dateGraphic).format('dddd[,] D [de] MMMM [del] YYYY');
    const fechaSpanish =  moment(datos.dateGraphic).format('DD[/]MM[/]YYYY');
    return {
        title: {
          text: `<p style="margin-left: 20px; margin-top: 7px;">
                  ${datos.titleGraphic}
                </p>`,
          align: "left",
          style: {
            'font-family':'Public Sans,sans-serif',
            'font-weight' : 700,
            'font-size': '18px'
          },
          useHTML: true,
        },
        subtitle:{
          text: `<p style="margin-left: 20px; margin-bottom: 5px; margin-top: 7px;">
                    ${datos.subtitleGraphic}
                  </p>
                  <p style="margin-left: 20px; margin-bottom: 5px;">
                    Fecha: <span style="font-weight:700">${textoFecha}</span>
                  </p>`,
          align: "left",
          useHTML: true,
          style:{
            'font-family':'Public Sans,sans-serif',
            'font-weight' : 400,
            'font-size': '14px',
            'color': '#637381',
            'display': 'flex',
            'flex-direction': 'column',
            'align-items': 'flex-start',
            'align-content': 'space-between',
            'margin-top': '6px !important',
            'margin-left': '10px !important'
          }
        },      
        series: [{             
          data: datos.data[0] ? datos.data[0] : null,
          name: 'Dispositivo',
          lineWidth: 3
        },
        {     
          data: (datos.data[1]?.length > 0) ? datos.data[1] : null,
          name: 'Umbral Máximo',
          visible: (datos.data[1]?.length > 0) ? true : false,
          lineWidth: 3
        },
        {     
          data:  (datos.data[2]?.length > 0) ? datos.data[2] : null,
          name: 'Umbral Mínimo',
          visible: (datos.data[2]?.length > 0) ? true : false,
          lineWidth: 3
        }],
        xAxis: {
          type: 'datetime',      
          title:{
            text: `Fecha: ${fechaSpanish} desde las 00:00h hasta las 23:59h` 
          }
        },
        yAxis:{          
          title:{
            text: `Unidad de Medida: ${datos.abrevDaily}` 
          }
        },
        credits:{
          enabled: false
        },
        tooltip: {
          headerFormat: '<table>'+
            '<tr><td><b style="font-size:11px">{point.x:%A, %d/%m a las %k:%M}</b></td></tr>',   
          pointFormat: '<tr><td style="color: {series.color}"><b>{series.name}: </b></td>' +
            '<td style="text-align: right"><b>{point.y} '+datos.abrevDaily+'</b></td></tr>',          
          footerFormat: '</table>',
          split: false,
          shared: true,
          useHTML: true,
          xDateFormat: '%Y-%m-%d',
          crosshairs: true
        },
        plotOptions: {
          series: {
              showInNavigator: true
          },
          line: {
            marker: {
                enabled: false
            }
          }
        },    
        chart:{
          height: '49%',
          className: 'Stylehighcharts',
          margin: 100
        }      
      }
}

