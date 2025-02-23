import axios from 'axios';

export const userApi = {
    async getUsers() {
        const response = await axios.get('http://localhost:8000/api/users');
        return response.data;
    },
    async deleteUser(userId) {
        const response = await axios.delete(`http://localhost:8000/api/users/${userId}`);
        return response.data;
    },
    async updateUser(userId, data) {
        const response = await axios.put(`http://localhost:8000/api/users/${userId}`, data);
        return response.data;
    },
    async createUser(data) {
        const response = await axios.post('http://localhost:8000/api/users', data);
        return response.data;
    },
    async getRoleNotUser() {
        const response = await axios.get('http://localhost:8000/api/role_not_user');
        return response.data
    }
};