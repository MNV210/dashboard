import axios from 'axios';

export const coursesApi = {
    async getCourses() {
        const response = await axios.get('http://localhost:8000/api/courses');
        return response.data;
    },
    async deleteCourse(courseId) {
        const response = await axios.delete(`http://localhost:8000/api/courses/${courseId}`);
        return response.data;
    },
    async updateCourse(courseId, data) {
        const response = await axios.put(`http://localhost:8000/api/courses/${courseId}`, data);
        return response.data;
    },
    async createCourse(data) {
        const response = await axios.post('http://localhost:8000/api/courses', data);
        return response.data;
    },
    async updateFileTraining(data) {
        const response = await axios.post(`http://localhost:8000/api/courses/update-file-training`,data);
        return response.data;
    },
    async getInfomationCourse(course_id) {
        const response = await axios.get(`http://localhost:8000/api/courses/${course_id}`);
        return response.data;
    },
}