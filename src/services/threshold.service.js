import axios from 'axios';
import { baseUrl } from './constants';
import { getToken } from './tokens';

export async function getThreshold(imei){
    const token = getToken();
    return axios.get(
      `${baseUrl}/management/${imei}/umbral`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
}

export async function saveThreshold(query){
  const token = getToken();
  const {
    imei,
    fabrica,
    ...rest
  } = query;
  return axios.put(
    `${baseUrl}/management/${imei}/umbral`,
    {
        fabrica,
        sensores: [
          rest
        ]
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
}