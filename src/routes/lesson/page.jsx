import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Upload, Select, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { LessonApi } from '../../api/lessonApi';
import { coursesApi } from '../../api/coursesApi';
import { AIApi } from '../../api/AI';

const LessonPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [courses, setCourses] = useState([]);
  const [uploadingLessons, setUploadingLessons] = useState(new Set());
  const [modalMode, setModalMode] = useState('create');
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonsResponse, coursesResponse] = await Promise.all([
          LessonApi.getLesson(),
          coursesApi.getCourses()
        ]);
        
        setData(lessonsResponse.data);
        setCourses(coursesResponse.data);
      } catch (error) {
        message.error('Không thể tải dữ liệu');
        console.error('Lỗi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const uploadVideo = async (lessonId, file) => {
    if (!file) return;
    try {
      setUploadingLessons(prev => new Set([...prev, lessonId]));
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await LessonApi.uploadVideo(formData);
      if (uploadResponse.data?.url) {
        await LessonApi.updateVideoURL({ 
          lesson_id: lessonId, 
          video_url: uploadResponse.data.url 
        });
        message.success('Tải lên video thành công');

        const lessonInfo = await LessonApi.getInfomationLesson(lessonId);
        await AIApi.uploadFileToAI({
          file_url: uploadResponse.data.url,
          file_type: lessonInfo.data.type
        });
      }
      
      const updatedLessons = await LessonApi.getLesson();
      setData(updatedLessons.data);
    } catch (error) {
      message.error('Không thể tải lên video');
      console.error('Lỗi tải lên video:', error);
    } finally {
      setUploadingLessons(prev => {
        const newSet = new Set(prev);
        newSet.delete(lessonId);
        return newSet;
      });
    }
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const file = values.file_upload?.[0]?.originFileObj;
      
      let lessonData = {
        course_id: values.course_id,
        lesson_name: values.lesson_name,
        type: file ? (file.type.startsWith('video/') ? 'video' : 'file') : values.lesson_type
      };

      if (modalMode === 'update') {
        await LessonApi.updateLesson(values.id, lessonData);
        await uploadVideo(values.id, file);
        message.success('Cập nhật bài học thành công');
      } else {
        const lessonResponse = await LessonApi.createLesson(lessonData);
        message.success('Tạo bài học thành công');
        await uploadVideo(lessonResponse.data.id, file);
      }
      setIsModalVisible(false);
      form.resetFields();
      
      const updatedLessons = await LessonApi.getLesson();
      setData(updatedLessons.data);
    } catch (error) {
      message.error('Không thể lưu bài học');
      console.error('Lỗi tạo/cập nhật bài học:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await LessonApi.deleteLesson(id);
      message.success('Xóa thành công');
      const updatedLessons = await LessonApi.getLesson();
      setData(updatedLessons.data);
    } catch (error) {
      message.error('Không thể xóa bài học');
      console.error('Lỗi xóa bài học:', error);
    }
  };

  const columns = [
    {
      title: 'Khóa học',
      dataIndex: 'course',
      key: 'course',
      render: (course) => course?.course_name || 'Không xác định'
    },
    {
      title: 'Bài học',
      dataIndex: 'lesson_name',
      key: 'lesson_name'
    },
    {
      title: 'Loại bài học',
      dataIndex: 'lesson_type',
      key: 'lesson_type',
      render: (type) => type === 'video' ? 'Bài học video' : 'Bài học file'
    },
    {
      title: 'Đường dẫn',
      key: 'video_url',
      render: (_, record) => (
        uploadingLessons.has(record.id) 
          ? <Spin /> 
          : <a href={record.video_url} target="_blank" rel="noopener noreferrer">
              {record.video_url}
            </a>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            onClick={() => {
              setModalMode('update');
              form.setFieldsValue({
                ...record,
                lesson_type: record.lesson_type
              });
              setIsModalVisible(true);
            }}
          >
            Chỉnh sửa
          </Button>
          <Button
            danger
            onClick={() => {
              Modal.confirm({
                title: 'Bạn có chắc chắn muốn xóa?',
                onOk: () => handleDelete(record.id)
              });
            }}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      <Button
        type="primary"
        onClick={() => {
          setModalMode('create');
          setIsModalVisible(true);
          form.resetFields();
        }}
        className="mb-4"
      >
        Tạo bài học mới
      </Button>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={modalMode === 'update' ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
        open={isModalVisible}
        onOk={handleCreate}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          
          <Form.Item name="lesson_type" hidden>
            <Input />
          </Form.Item>
          
          <Form.Item
            name="course_id"
            label="Khóa học"
            rules={[{ required: true, message: 'Vui lòng chọn khóa học!' }]}
          >
            <Select
              placeholder="Chọn khóa học"
              loading={courses?.length === 0}
            >
              {courses?.map(course => (
                <Select.Option key={course.id} value={course.id}>
                  {course.course_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="lesson_name"
            label="Tên bài học"
            rules={[{ required: true, message: 'Vui lòng nhập tên bài học!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="file_upload"
            label="Tải lên file"
            valuePropName="fileList"
            getValueFromEvent={e => e?.fileList}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept="video/*,.pdf,.doc,.xls,.ppt"
            >
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LessonPage;