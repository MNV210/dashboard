import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Upload, Select, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { LessonApi } from '../../api/lessonApi';
import { coursesApi } from '../../api/coursesApi';

const LessonPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [courses, setCourses] = useState([]);
  const [uploadingLessons, setUploadingLessons] = useState(new Set());
  const [modalMode, setModalMode] = useState('create');
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
      message.error('Không thể tải danh sách bài học');
      console.error('Lỗi tải bài học:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getCourses();
      setCourses(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách khóa học');
      console.error('Lỗi tải khóa học:', error);
    }
  };

  const handleEdit = (record) => {
    setModalMode('update');
    form.setFieldsValue({
      ...record,
      lesson_type: record.lesson_type
    });
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa bài học này?',
      onOk: async () => {
        try {
          await LessonApi.deleteLesson(record.id);
          fetchLessons();
          message.success('Xóa bài học thành công');
        } catch (error) {
          message.error('Không thể xóa bài học');
          console.error('Lỗi xóa bài học:', error);
        }
      },
    });
  };

  const uploadVideo = async (lessonId, file) => {
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
      }
      await fetchLessons();
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

  const beforeUpload = (file) => {
    const isVideo = file.type.startsWith('video/');
    const validDocumentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (!isVideo && !validDocumentTypes.includes(file.type)) {
      message.error('Chỉ được phép tải lên video hoặc tài liệu (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX)!');
      return false;
    }

    const maxSize = isVideo ? 500 : 50;
    if (file.size / 1024 / 1024 > maxSize) {
      message.error(`File phải nhỏ hơn ${maxSize}MB!`);
      return false;
    }

    return false;
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const file = values.file_upload?.[0]?.originFileObj;
      
      if (modalMode === 'create' && !file) {
        message.error('Vui lòng tải lên file!');
        return;
      }

      let lesson_type = values.lesson_type;
      if (file) {
        lesson_type = file.type.startsWith('video/') ? 'video' : 'file';
      }

      const lessonData = {
        course_id: values.course_id,
        lesson_name: values.lesson_name,
        type: lesson_type
      };

      if (modalMode === 'update') {
        await LessonApi.updateLesson(values.id, lessonData);

        await uploadVideo(values.id, file);
        
        message.success('Cập nhật bài học thành công');
      } else {
        const lessonResponse = await LessonApi.createLesson(lessonData);
          await uploadVideo(lessonResponse.data.id, file);
        message.success('Tạo bài học thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
      await fetchLessons();
    } catch (error) {
      message.error('Không thể lưu bài học');
      console.error('Lỗi tạo/cập nhật bài học:', error);
    }
  };

  const truncateUrl = (url) => {
    const maxLength = 50;
    return url && url.length > maxLength ? `${url.substring(0, maxLength)}...` : url;
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
      key: 'lesson_name',
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
      render: (_, record) => {
        const url = record.video_url ;
        return uploadingLessons.has(record.id) ? (
          <Space>
            <Spin />
            <span>Đang tải lên...</span>
          </Space>
        ) : (
          <a href={url} target="_blank" rel="noopener noreferrer">
            {truncateUrl(url || '')}
          </a>
        );
      }
    },
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

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button 
          type="primary" 
          onClick={() => {
            setModalMode('create');
            setIsModalVisible(true);
            form.resetFields();
          }}
        >
          Tạo bài học mới
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
        title={modalMode === 'update' ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
        visible={isModalVisible}
        onOk={handleCreate}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        okText={modalMode === 'update' ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        width={600}
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
              loading={!courses || courses.length === 0}
            >
              {courses.map(course => (
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
            <Input placeholder="Nhập tên bài học" />
          </Form.Item>

          <Form.Item
            name="file_upload"
            label="Tải lên file"
            valuePropName="fileList"
            getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList}
            rules={[{ required: modalMode === 'create', message: 'Vui lòng tải lên file!' }]}
          >
            <Upload
              beforeUpload={beforeUpload}
              maxCount={1}
              accept="video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              listType="text"
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