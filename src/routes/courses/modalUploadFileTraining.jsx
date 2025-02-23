import React, { useState } from 'react';
import { Modal, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { LessonApi } from '../../api/lessonApi';
import { coursesApi } from '../../api/coursesApi';

const ModalUploadFileTraining = ({ visible, onClose, courseId }) => {
  const [fileList, setFileList] = useState([]);

  const handleUpload = ({ fileList }) => {
    setFileList(fileList);
  };

  const uploadFileTraining = async (courseId, file) => {
    if (!file) return;
    try {
      // setUploadingLessons(prev => new Set([...prev, lessonId]));
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await LessonApi.uploadVideo(formData);
      if (uploadResponse.data?.url) {
        await coursesApi.updateFileTraining({ 
          course_id: courseId, 
          file_url: uploadResponse.data.url 
        });
        message.success('Tải lên video thành công');

        // const CourseInfomation = await coursesApi.getInfomationCourse(course_id);
        // await AIApi.uploadFileToAI({
        //   file_url: uploadResponse.data.url,
        //   file_type: 'file'
        // });
      }
      
    //   await coursesApi.getCourses();
    } catch (error) {
      message.error('Tải tài liệu lên thất bại');
      console.error('Lỗi tải lên video:', error);
    } finally {
      // setUploadingLessons(prev => {
      //   const newSet = new Set(prev);
      //   // newSet.delete(lessonId);
      //   return newSet;
      // });
    }
  };

  const handleOk = () => {
    // Handle file upload logic here
    // console.log('Files uploaded for course:', courseId, fileList);
    uploadFileTraining(courseId, fileList[0].originFileObj);
    setFileList([]); // Reset the file list
    onClose();
  };

  const handleCancel = () => {
    setFileList([]); // Reset the file list
    onClose();
  };

  return (
    <Modal
      title="Upload Training Files"
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Upload
        fileList={fileList}
        onChange={handleUpload}
        beforeUpload={() => false}
        multiple
      >
        <Button icon={<UploadOutlined />}>Chọn file </Button>
      </Upload>
    </Modal>
  );
};

export default ModalUploadFileTraining;
