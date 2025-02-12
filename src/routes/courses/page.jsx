import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Select, message, Upload } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { UploadOutlined } from '@ant-design/icons';
import { coursesApi } from '../../api/coursesApi';
import { userApi } from '../../api/userApi';
import moment from 'moment'; // Import moment for date formatting
import defaultImage from '../../assets/default.jpg';

const CoursesPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [users, setUsers] = useState([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await coursesApi.getCourses();
        setData(response.data);
        const usersResponse = await userApi.getUsers(); // Assuming this is the correct path
        setUsers(usersResponse.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (record) => {
    setEditingCourse(record);
    setValue('course_name', record.course_name);
    setValue('course_description', record.course_description);
    setValue('teacher_id', record.teacher_id);
    setIsModalVisible(true);
  };

  const showDeleteConfirm = (course) => {
    setCourseToDelete(course);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (courseToDelete) {
      setIsDeleteLoading(true);
      try {
        await coursesApi.deleteCourse(courseToDelete.id);
        message.success('Khóa học đã được xóa');
        // Refresh the data
        const response = await coursesApi.getCourses();
        setData(response.data);
      } catch (error) {
        message.error('Failed to delete course');
      } finally {
        setIsDeleteLoading(false);
        setIsDeleteModalVisible(false);
        setCourseToDelete(null);
      }
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      const formDataWithImage = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key == "image_url" && formData[key] && formData[key].length > 0) {
          formDataWithImage.append(key, formData[key][0].originFileObj); // Lấy file thực tế
        } else {
          formDataWithImage.append(key, formData[key]);
        }
      });
      

      if (editingCourse) {
        await coursesApi.updateCourse(editingCourse.id, formDataWithImage);
        message.success('Cập nhật thành công');
      } else {
        await coursesApi.createCourse(formDataWithImage);
        message.success('Thêm mới thành công');
      }
      setIsModalVisible(false);
      reset();
      setEditingCourse(null);
      // Refresh the data
      const response = await coursesApi.getCourses();
      setData(response.data);
    } catch (error) {
      message.error('Failed to create/update course');
    }
  };

  const columns = [
    {
      title: 'Tên khóa học',
      dataIndex: 'course_name',
      // key: 'course_name',
      render:(text, record) => <div style={{ textAlign: 'center' }}>
        <img 
          src={record.image_url == null ? defaultImage : record.image_url} 
          alt="Avatar" 
          style={{ 
            width: 50, 
            height: 50, 
            borderRadius: '50%', 
            objectFit: 'cover', 
            display: 'block', 
            margin: '0 auto' 
          }} 
        />
        <span style={{ display: 'block', marginTop: 8 }}>{text}</span>
      </div>
    },
    {
      title: 'Mô tả',
      dataIndex: 'course_description',
      key: 'course_description',
    },
    {
      title: 'Người tạo',
      dataIndex: 'users',
      key: 'users',
      render: (users) => users.map(user => user.name).join(', '),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at) => moment(created_at).format('DD/MM/YYYY'), // Format date
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>Chỉnh sửa</Button>
          <Button onClick={() => showDeleteConfirm(record)} danger>Xóa</Button>
        </Space>
      ),
    },
    // Add more columns as needed
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setIsModalVisible(true);
          reset({
            course_name: '',
            course_description: '',
            teacher_id: '',
            thumnail: []
          });
          setEditingCourse(null);
        }}
      >
        Create
      </Button>
      <Table columns={columns} dataSource={data} loading={loading} rowKey="id" />
      <Modal
        title={editingCourse ? "Chỉnh sửa khóa học" : "Tạo mới khóa học"}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingCourse(null);
          reset();
        }}
        footer={null}
      >
        <Form onFinish={handleSubmit(handleCreateOrUpdate)} layout="vertical">
          <Form.Item label="Tên khóa học" validateStatus={errors.course_name && "error"} help={errors.course_name && "Tên khóa học là bắt buộc"}>
            <Controller
              name="course_name"
              control={control}
              defaultValue=""
              render={({ field }) => <Input {...field} />}
              rules={{ required: "Tên khóa học là bắt buộc" }}
            />
          </Form.Item>
          <Form.Item label="Mô tả" validateStatus={errors.course_description && "error"} help={errors.course_description && "Mô tả là bắt buộc"}>
            <Controller
              name="course_description"
              control={control}
              defaultValue=""
              render={({ field }) => <Input {...field} />}
              // rules={{ required: "Mô tả là bắt buộc" }}
            />
          </Form.Item>
          <Form.Item label="Giáo viên" validateStatus={errors.teacher_id && "error"} help={errors.teacher_id && "Giáo viên là bắt buộc"}>
            <Controller
              name="teacher_id"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Select {...field} onChange={(value) => field.onChange(value)}>
                  {users.map(user => (
                    <Select.Option key={user.id} value={user.id}>
                      {user.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
              rules={{ required: "Giáo viên là bắt buộc" }}
            />
          </Form.Item>
          <Form.Item label="Upload Image" validateStatus={errors.thumnail && "error"} help={errors.thumnail && "Image is required"}>
            <Controller
              name="image_url"
              control={control}
              defaultValue={[]} // Đảm bảo giá trị mặc định là mảng rỗng
              render={({ field: { onChange, value } }) => (
                <Upload
                  listType="picture"
                  beforeUpload={() => false} // Ngăn việc upload tự động
                  onChange={({ fileList }) => onChange(fileList)} // Cập nhật fileList vào state
                  fileList={value}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              )}
              // rules={editingCourse ? {} : { required: "Image is required" }} // Không yêu cầu khi chỉnh sửa
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Xác nhận xóa"
        visible={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Đồng ý"
        cancelText="Không"
        confirmLoading={isDeleteLoading}
      >
        <p>Bạn có muốn xóa khóa học này không?</p>
      </Modal>
    </div>
  );
};

export default CoursesPage;