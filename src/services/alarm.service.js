import axios from 'axios';
import { baseUrl } from './constants';
import { getToken } from './tokens';

export async function getAlarm(query){
    const token = getToken();
    const {data} = await axios.get(
      `${baseUrl}/dashboard/alarms?${query}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return data;
}