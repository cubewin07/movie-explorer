import axios from 'axios';
import Cookies from 'js-cookie';

const token = Cookies.get('token');

const instance = axios.create({
    baseURL: 'https://moviehub.congminh.site/api/',
    timeout: 10000, // 10 seconds
    headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : undefined,
    },
});

export default instance;
