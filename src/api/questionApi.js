import axios from 'axios';

export const questionApi = {
    async getQuestions() {
        const response = await axios.get(`http://localhost:8000/api/questions`);
        return response.data;
    },
    async getQuestionById(questionId) {
        const response = await axios.get(`http://localhost:8000/api/questions/exercise/${questionId}`);
        return response.data;
    },
    async deleteQuestion(questionId) {
        const response = await axios.delete(`http://localhost:8000/api/questions/${questionId}`);
        return response.data;
    },
    async updateQuestion(questionId, data) {
        const response = await axios.put(`http://localhost:8000/api/questions/${questionId}`, data);
        return response.data;
    },
    async createQuestion(data) {
        const response = await axios.post('http://localhost:8000/api/questions', data);
        return response.data;
    },
    async importExcelQuestion(data) {
        const response = await axios.post('http://localhost:8000/api/import',data);
        return response.data
    },
    async getQuestionByQuestionText(exerciseId,data) {
        const response = await axios.post(`http://localhost:8000/api/questions/exercise_id/${exerciseId}/search`,data)
        return response.data
    },
    async exportQuestions(data) {
        const response = await axios.post('http://localhost:8000/api/export',data)
        return response
    }
}