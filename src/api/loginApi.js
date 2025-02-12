import axios from 'axios';

export const loginApi = {
    async login(data) {
        const response = await axios.post('http://localhost:8000/api/login', data);
        return response.data;
    }
}