import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { questionApi } from '../../api/questionApi'
import { Typography, Spin, Table, Button, Modal, Form, Input, message, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { debounce } from 'lodash'
import axios from 'axios'

function ExerciseInfoPage() {
  const { id } = useParams()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isFileModalVisible, setIsFileModalVisible] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const fetchQuestions = async (search = '') => {
    try {
      // const data = {'question_text',search}
      
      const response = await questionApi.getQuestionByQuestionText(id, {search})
      setQuestions(response.data)
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchQuestions()
  }, [id])

  const handleSearch = debounce((value) => {
    setSearchTerm(value)
    fetchQuestions(value)
  }, 300)

  const handleCreateClick = () => {
    setCurrentQuestion(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEditClick = (record) => {
    setCurrentQuestion(record)
    form.setFieldsValue(record)
    setIsModalVisible(true)
  }

  const showDeleteConfirm = (record) => {
    setDeleteRecord(record)
    setIsDeleteModalVisible(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await questionApi.deleteQuestion(deleteRecord.id)
      setQuestions(questions.filter(question => question.id !== deleteRecord.id))
      message.success('Xóa câu hỏi thành công!')
    } catch (error) {
      message.error('Xóa câu hỏi thất bại!')
    } finally {
      setIsDeleteModalVisible(false)
      setDeleteRecord(null)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false)
    setDeleteRecord(null)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()

      if (currentQuestion) {
        const newValues = { ...values, exercise_id: id }
        await questionApi.updateQuestion(currentQuestion.id, newValues)
        setQuestions(questions.map(question => question.id === currentQuestion.id ? { ...question, ...newValues } : question))
        message.success('Chỉnh sửa câu hỏi thành công!')
      } else {
        const newValues = { ...values, exercise_id: id }
        const response = await questionApi.createQuestion(newValues)
        setQuestions([...questions, response.data])
        message.success('Tạo câu hỏi thành công!')
      }
      setIsModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('Lưu câu hỏi thất bại!')
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList.slice(-1)) // Allow only one file
  }

  const handleFileSubmit = () => {
    setIsFileModalVisible(true)
  }

  const handleFileModalOk = async () => {
    try {
      const formData = new FormData()
      formData.append('exercise_id', id)
      fileList.forEach(file => {
        formData.append('files', file.originFileObj)
      })
      await questionApi.importExcelQuestion(formData)
      message.success('Import file thành công!')
      setFileList([])
      setIsFileModalVisible(false)
      fetchQuestions()
    } catch (error) {
      message.error('Import file thất bại!')
    }
  }

  const handleFileModalCancel = () => {
    setIsFileModalVisible(false)
    setFileList([])
  }

  const handleExportExcel = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/export/${id}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Danh sách câu hỏi.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error('Xuất Excel thất bại:', error);
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Câu hỏi',
      dataIndex: 'question_text',
      key: 'question_text',
    },
    {
      title: 'Đáp án 1',
      dataIndex: 'option_1',
      key: 'option_1',
    },
    {
      title: 'Đáp án 2',
      dataIndex: 'option_2',
      key: 'option_2',
    },
    {
      title: 'Đáp án 3',
      dataIndex: 'option_3',
      key: 'option_3',
    },
    {
      title: 'Đáp án 4',
      dataIndex: 'option_4',
      key: 'option_4',
    },
    {
      title: 'Đáp án đúng',
      dataIndex: 'is_correct',
      key: 'is_correct',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (text, record) => (
        <>
          <Button onClick={() => handleEditClick(record)}>Edit</Button>
          <Button onClick={() => showDeleteConfirm(record)} danger>Delete</Button>
        </>
      ),
    },
  ]

  if (loading) {
    return <Spin />
  }

  return (
    <div>
      <Typography.Title level={2}>Thông tin bài tập</Typography.Title>
      <div className='flex justify-between items-center mb-5'>
        <Button type="primary" onClick={handleCreateClick}>Tạo câu hỏi</Button>
        <Button type="primary" onClick={handleFileSubmit} style={{ marginLeft: '10px' }}>Import file</Button>
        <Button type="primary" onClick={handleExportExcel} style={{ marginLeft: '10px' }}>Export Excel</Button>
        {/* <Input.Search
          placeholder="Tìm kiếm câu hỏi"
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 200, marginLeft: '10px' }}
        /> */}
      </div>
      <Table dataSource={questions} columns={columns} rowKey="id" />
      <Modal
        title={currentQuestion ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="question_text"
            label="Câu hỏi"
            rules={[{ required: true, message: 'Vui lòng nhập câu hỏi!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="option_1"
            label="Đáp án 1"
            rules={[{ required: true, message: 'Vui lòng nhập đáp án 1!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="option_2"
            label="Đáp án 2"
            rules={[{ required: true, message: 'Vui lòng nhập đáp án 2!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="option_3"
            label="Đáp án 3"
            rules={[{ required: true, message: 'Vui lòng nhập đáp án 3!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="option_4"
            label="Đáp án 4"
            rules={[{ required: true, message: 'Vui lòng nhập đáp án 4!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="is_correct"
            label="Đáp án đúng"
            rules={[{ required: true, message: 'Vui lòng nhập đáp án đúng!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Import file"
        visible={isFileModalVisible}
        onOk={handleFileModalOk}
        onCancel={handleFileModalCancel}
      >
        <Upload fileList={fileList} onChange={handleFileChange} maxCount={1}>
          <Button icon={<UploadOutlined />}>Chọn file</Button>
        </Upload>
      </Modal>
      <Modal
        title="Xác nhận xóa"
        visible={isDeleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        <Typography.Text>Bạn có chắc chắn muốn xóa câu hỏi này?</Typography.Text>
      </Modal>
    </div>
  )
}

export default ExerciseInfoPage
