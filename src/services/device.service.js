import axios from 'axios';
import { baseUrl } from './constants';

export async function getDeviceData(token, ts, interval, devices) {
    const header = { headers: { Authorization: `Bearer ${token}`}}
    const payload = { ts, interval, devices: [ devices ] }

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