import axios from 'axios';
import { baseUrl } from './constants';
import { getAccessToken } from './tokens';

export async function getTickets(query){
    const token = getAccessToken();
    return axios.get(
      `${baseUrl}/tickets?${query}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
}

export async function createTickets(query){
  const token = getAccessToken();
  const {
    a,
    st,
    imei,
    fabrica,
    fromDate,
    toDate
  } = query;
  return axios.post(
    `${baseUrl}/tickets`,
    {
      dispositivos: [
        {
          fabrica,
          imei,
          sensores: [
              {
                  a,
                  st,
                  intervaloInicial: fromDate,
                  intervaloFinal: toDate
              }
          ]
        }
      ]
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
}