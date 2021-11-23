import axios from 'axios';
import { baseUrl } from './constants';

export async function getDeviceData(token, ts, interval, devices) {
    const header = { headers: { Authorization: `Bearer ${token}`}}
    const payload = { ts, interval, devices: [ devices ] }

    const { data } = await axios.post(`${baseUrl}/devices-data`, payload, header);

    return data;
}
