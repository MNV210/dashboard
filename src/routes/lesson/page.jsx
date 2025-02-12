import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Upload, Select, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import {LessonApi} from '../../api/lessonApi';
import {coursesApi } from '../../api/coursesApi'

// API Services

const LessonPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [courses, setCourses] = useState([]);
  const [uploadingLessons, setUploadingLessons] = useState(new Set());
  const [form] = Form.useForm();

  useEffect(() => {
    fetchLessons();
    fetchCourses();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await LessonApi.getLesson();
      setData(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error('Failed to fetch lessons');
      console.error('Fetch lessons error:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getCourses();
      setCourses(response.data);
    } catch (error) {
      message.error('Failed to fetch courses');
      console.error('Fetch courses error:', error);
    }
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this lesson?',
      onOk: async () => {
        try {
          await LessonApi.deleteLesson(record.id);
          fetchLessons();
          message.success('Lesson deleted successfully');
        } catch (error) {
          message.error('Failed to delete lesson');
          console.error('Delete lesson error:', error);
        }
      },
    });
  };

  const uploadVideo = async (lessonId, videoFile) => {
    try {
      setUploadingLessons(prev => new Set([...prev, lessonId]));

      const formData = new FormData();
      formData.append('file', videoFile);

      // Log FormData content for debugging
      for (let pair of formData.entries()) {
        console.log('FormData content:', pair[0], pair[1]);
      }

      const uploadResponse = await LessonApi.uploadVideo(formData);
      console.log('Upload video response:', uploadResponse.data);
      
      if (uploadResponse.data && uploadResponse.data.url) {
        await LessonApi.updateVideoURL({
          lesson_id: lessonId,
          video_url: uploadResponse.data.url
        });
      } else {
        throw new Error('Invalid upload response');
      }

      setUploadingLessons(prev => {
        const newSet = new Set(prev);
        newSet.delete(lessonId);
        return newSet;
      });

      await fetchLessons();
      message.success('Video uploaded successfully');
    } catch (error) {
      setUploadingLessons(prev => {
        const newSet = new Set(prev);
        newSet.delete(lessonId);
        return newSet;
      });
      message.error('Failed to upload video');
      console.error('Upload video error:', error);
    }
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values:', values);

      if (values.id) {
        await LessonApi.updateLesson(values.id, values);
        message.success('Lesson updated successfully');
      } else {
        // Create lesson first
        const lessonResponse = await LessonApi.createLesson({
          course_id: values.course_id,
          lesson_name: values.lesson_name
        });
        
        message.success('Lesson created successfully');
        
        // Start background video upload if video is provided
        if (values.lesson_video?.[0]?.originFileObj) {
          console.log('Starting video upload for file:', values.lesson_video[0].originFileObj);
          uploadVideo(lessonResponse.data.id, values.lesson_video[0].originFileObj);
        }
      }

      setIsModalVisible(false);
      form.resetFields();
      await fetchLessons();
    } catch (error) {
      message.error('Failed to save lesson');
      console.error('Create/Update lesson error:', error);
    }
  };

  const truncateUrl = (url) => {
    const maxLength = 50; // Adjust the length as needed
    return url.length > maxLength ? `${url.substring(0, maxLength)}...` : url;
  };

  const columns = [
    {
      title: 'Khóa học',
      dataIndex: 'course',
      key: 'course',
      render: (course) => course ? course.course_name : 'Unknown'
    },
    {
      title: 'Bài học',
      dataIndex: 'lesson_name',
      key: 'lesson_name',
    },
    {
      title: 'Đường dẫn video',
      dataIndex: 'video_url',
      key: 'video_url',
      render: (video_url, record) => (
        uploadingLessons.has(record.id) ? (
          <Space>
            <Spin />
            <span>Uploading video...</span>
          </Space>
        ) : (
          <a href={video_url} target="_blank" rel="noopener noreferrer">
            {truncateUrl(video_url)}
          </a>
        )
      )
    },
    // {
    //   title: 'Lesson Duration',
    //   dataIndex: 'lesson_duration',
    //   key: 'lesson_duration',
    // },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>Chỉnh sửa</Button>
          <Button onClick={() => handleDelete(record)} danger>Xóa</Button>
        </Space>
      ),
    },
  ];

  const beforeUpload = (file) => {
    // Add any file validation here
    const isVideo = file.type.startsWith('video/');
    if (!isVideo) {
      message.error('Bạn phải chọn file !');
    }
    
    const isLt500M = file.size / 1024 / 1024 < 500;
    if (!isLt500M) {
      message.error('Dung lượng video nhỏ hơn 500MB!');
    }
    
    return false; // Return false to prevent auto upload
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Create Lesson
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={data} 
        loading={loading} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={form.getFieldValue('id') ? "Edit Lesson" : "Create Lesson"}
        visible={isModalVisible}
        onOk={handleCreate}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        okText={form.getFieldValue('id') ? "Update" : "Create"}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="course_id"
            label="Khóa học"
            rules={[{ required: true, message: 'Please select a course!' }]}
          >
            <Select
              placeholder="Select a course"
              loading={!courses || courses.length === 0}
            >
              {courses && courses.map(course => (
                <Select.Option key={course.id} value={course.id}>
                  {course.course_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="lesson_name"
            label="Bài học"
            rules={[{ required: true, message: 'Please input the lesson name!' }]}
          >
            <Input placeholder="Enter lesson name" />
          </Form.Item>

          <Form.Item
            name="lesson_video"
            label="Upload Video"
            valuePropName="fileList"
            getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
            rules={[{ required: !form.getFieldValue('id'), message: 'Please upload a video!' }]}
          >
            <Upload
              beforeUpload={beforeUpload}
              maxCount={1}
              accept="video/*"
              listType="text"
            >
              <Button icon={<UploadOutlined />}>Select Video</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LessonPage;