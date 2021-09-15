import axios from 'axios';
import { baseUrl } from './constants';

export async function loginService(payload) {
    const { data } = await axios.post(`${baseUrl}/auth/login`, payload)

    return data.details;
}

export async function getDevices(token) {
    const header = { headers: { Authorization: `Bearer ${token}`}}
    const { data } = await axios.get(`${baseUrl}/devices`, header)

    if(data.status == 'ok') {
        localStorage.setItem('devices', JSON.stringify(data.data))
    }
}