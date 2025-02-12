import axios from 'axios';

export const ExercisesApi = {
    async getExercises() {
        const response = await axios.get('http://localhost:8000/api/exercises');
        return response.data;
    },
    async deleteExercises(ExercisesId) {
        const response = await axios.delete(`http://localhost:8000/api/exercises/${ExercisesId}`);
        return response.data;
    },
    async updateExercises(ExercisesId, data) {
        const response = await axios.put(`http://localhost:8000/api/exercises/${ExercisesId}`, data);
        return response.data;
    },
    async createExercises(data) {
        const response = await axios.post('http://localhost:8000/api/exercises', data);
        return response.data;
    }
}