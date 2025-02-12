import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Typography, Tabs, Upload } from 'antd'
import { ExercisesApi } from '../../api/exercisesApi'
import { coursesApi } from '../../api/coursesApi'
import { UploadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

function ExercisesPage() {
  const [data, setData] = useState([])
  const [courses, setCourses] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [form] = Form.useForm()
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false)
  const [questionForm] = Form.useForm()
  const [fileList, setFileList] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ExercisesApi.getExercises()
        setData(response.data)

        // response.data.forEach(element => {
        //     console.log(element.courses.course_name)
        // });

      } catch (error) {
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await coursesApi.getCourses()
        setCourses(response.data)
      } catch (error) {
      }
    }
    fetchCourses()
  }, [])

  const handleCreateClick = () => {
    setIsEditMode(false)
    setIsModalVisible(true)
  }

  const handleCreateQuestionClick = (record) => {
    setCurrentRecord(record)
    setIsQuestionModalVisible(true)
  }

  const handleQuestionModalCancel = () => {
    setIsQuestionModalVisible(false)
    questionForm.resetFields()
  }

  const handleQuestionSubmit = async () => {
    try {
      const values = await questionForm.validateFields()
      // Logic to submit question data
      message.success('Thêm câu hỏi thành công!')
      setIsQuestionModalVisible(false)
      questionForm.resetFields()
    } catch (error) {
    }
  }

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList)
  }

  const handleFileSubmit = async () => {
    try {
      // Logic to submit file data
      message.success('Import file thành công!')
      setIsQuestionModalVisible(false)
      setFileList([])
    } catch (error) {
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (isEditMode) {
        await ExercisesApi.updateExercises(currentRecord.id, values)
        message.success('Chỉnh sửa bài tập thành công!')
      } else {
        await ExercisesApi.createExercises(values)
        message.success('Tạo mới bài tập thành công!')
      }
      setIsModalVisible(false)
      form.resetFields()
      const response = await ExercisesApi.getExercises()
      setData(response.data)
    } catch (error) {
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  const handleEditClick = (record) => {
    setIsEditMode(true)
    setCurrentRecord(record)
    form.setFieldsValue(record)
    setIsModalVisible(true)
  }

  const handleDeleteClick = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa bài tập này?',
      onOk: async () => {
        try {
          await ExercisesApi.deleteExercises(record.id)
          const response = await ExercisesApi.getExercises()
          setData(response.data)
          message.success('Xóa bài tập thành công!')
        } catch (error) {
        }
      },
    })
  }

  const handleShowInfoClick = (record) => {
    navigate(`/exercise-info/${record.id}`)
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên bài tập',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Môn học',
      key: 'courses',
      render: (text, record) => {
        console.log(record); // Ghi log toàn bộ bản ghi (record)
        return record.courses ? record.courses.course_name : 'Không có dữ liệu';
      },
    },
    {
      title: "Số lượng câu hỏi",
      dataIndex: "total_question",
      key: "total_question"
    },
    {
      title: "Thời gian làm bài",
      dataIndex: "time",
      key: "time"
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (text, record) => (
        <>
          <Button onClick={() => handleEditClick(record)}> Chỉnh sửa</Button>
          <Button onClick={() => handleDeleteClick(record)} danger>Xóa</Button>
          {/* <Button type="primary" onClick={() => handleCreateQuestionClick(record)}>Tạo câu hỏi</Button> */}
          <Button onClick={() => handleShowInfoClick(record)}>Thông tin</Button>
        </>
      ),
    },
  ]

  return (
    <>
      <div className='flex justify-between items-center mb-5'>
        <Typography.Title level={2}>Bài tập</Typography.Title>
        <Button type="primary" style={{ marginRight: '10px' }} onClick={handleCreateClick}>Tạo mới</Button>
      </div>
      <Table dataSource={data} columns={columns} rowKey="id" />

      {/* Modal tạo mới bài kiểm tra */}
      <Modal
        title={isEditMode ? "Chỉnh sửa" : "Tạo mới"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu tiêu đề của bài kiểm tra!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="course_id"
            label="Môn học"
            rules={[{ required: true, message: 'Vui lòng chọn môn học cho bài kiểm tra!' }]}
          >
            <Select>
              {Array.isArray(courses) && courses.map(course => (
                <Select.Option key={course.id} value={course.id}>
                  {course.course_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="total_question"
            label="Số lượng câu hỏi"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng câu hỏi!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="time"
            label="Thời gian làm bài (phút)"
            rules={[{ required: true, message: 'Vui lòng nhập thời gian làm bài!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal tạo câu hỏi */}
      <Modal
        title="Tạo câu hỏi"
        visible={isQuestionModalVisible}
        onCancel={handleQuestionModalCancel}
        footer={[
          <Button key="cancel" onClick={handleQuestionModalCancel}>Hủy</Button>,
          <Button key="submit" type="primary" onClick={handleQuestionSubmit}>Lưu</Button>,
        ]}
      >
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Thêm câu hỏi" key="1">
            <Form form={questionForm} layout="vertical">
              <Form.Item
                name="question"
                label="Câu hỏi"
                rules={[{ required: true, message: 'Vui lòng nhập câu hỏi!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="answer"
                label="Đáp án"
                rules={[{ required: true, message: 'Vui lòng nhập đáp án!' }]}
              >
                <Input />
              </Form.Item>
            </Form>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Import file" key="2">
            <Upload fileList={fileList} onChange={handleFileChange}>
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
            <Button type="primary" onClick={handleFileSubmit} style={{ marginTop: '10px' }}>Import file</Button>
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    </>
  )
}

export default ExercisesPage