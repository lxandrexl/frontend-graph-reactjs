import axios from 'axios';
import { baseUrl } from './constants';
import { getToken } from './tokens';

export async function getAlarm(query){
    const token = getToken();
    return axios.get(
      `${baseUrl}/alarms?${query}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
}