import axios from 'axios';

export const LessonApi = {
    async getLesson() {
        const response = await axios.get('http://localhost:8000/api/lessons');
        return response.data;
    },
    async deleteLesson(lessonId) {
        const response = await axios.delete(`http://localhost:8000/api/lessons/${lessonId}`);
        return response.data;
    },
    async updateLesson(lessonId, data) {
        const response = await axios.put(`http://localhost:8000/api/lessons/${lessonId}`, data);
        return response.data;
    },
    async createLesson(data) {
        const response = await axios.post('http://localhost:8000/api/lessons', data);
        return response.data;
    },
    async updateVideoURL(data) {
        const response = await axios.post('http://localhost:8000/api/lesson/update-video-URL', data);
        return response.data;
    },
    async uploadVideo(data) {
        const response = await axios.post('http://localhost:8001/upload/', data);
        return response;
    }
}