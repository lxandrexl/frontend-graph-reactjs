import axios from 'axios';
import { baseUrl } from './constants';
import * as moment from 'moment-timezone';
import 'moment/locale/es';

export async function getDeviceData(token, ts, interval, devices) {

    moment.locale('es');

    //const dateYesterday = moment().subtract(1, 'days').tz('America/Lima').format('YYYY-MM-DD HH:mm:ss');
    
    const dateYesterday = (ts !== "") 
      ? moment(ts).tz('America/Lima').format('YYYY-MM-DD HH:mm:ss')
      : "";

    const header = { headers: { Authorization: `Bearer ${token}`}} 

    const payload = (ts !== "") 
      ? { ts:dateYesterday, interval:1740, devices: [ devices ] } 
      : { ts, interval, devices: [ devices ] }  

    const { data } = await axios.post(`${baseUrl}/devices-data`, payload, header);

    return data;
}

export async function getStatsData(token){
    return await axios.get(
      `${baseUrl}/dashboard/stats`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
}
  
export async function getAlertsData(token, today, lastTime, isLoaded, devices) {
  const header = { headers: { Authorization: `Bearer ${token}` } };
  const payload = { today, lastTime, isLoaded, devices };

  const { data } = await axios.post(`${baseUrl}/alerts`, payload, header);

  return data;
}