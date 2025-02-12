import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Input, Button, Checkbox, Form, notification } from 'antd' // Import notification from antd
import { loginApi } from '../../api/loginApi' // Adjust the import path as necessary
import { useNavigate } from 'react-router-dom' // Import useNavigate from react-router-dom

function LoginPage() {
  const { control, handleSubmit } = useForm()
  const navigate = useNavigate() // Initialize useNavigate

  useEffect(() => {
    // Check if user is already logged in
    if (localStorage.getItem('token') || sessionStorage.getItem('token')) {
      navigate('/') // Redirect to home page if session exists
    }
  }, [navigate])

  const onSubmit = async data => {
    try {
      const response = await loginApi.login(data)
      console.log(response)
      if (response.status_code === 200 && response.info.role!="user") {
        notification.success({
          message: 'Đăng nhập thành công',
          description: 'Chào mừng bạn quay trở lại.',
        })
        // Save user information to localStorage or sessionStorage
        localStorage.setItem('token', JSON.stringify(response.info))
        navigate('/') // Redirect to home page
      } else {
        notification.error({
          message: 'Đăng nhập thât bại',
          description: 'Tài khoản hoặc mật khẩu không đúng.',
        })
      }
    } catch (error) {
      notification.error({
        message: 'Đăng nhập thât bại',
        description: 'Đã có lỗi xảy ra, vui lòng thử lại sau.',
      })
    }
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo" />
          Flowbite
        </a>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>
            <Form className="space-y-4 md:space-y-6 " onFinish={handleSubmit(onSubmit)} name="loginForm">
              <Form.Item label="Your email" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                <Controller
                  name="email"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <Input type="email" {...field} placeholder="name@company.com" />}
                />
              </Form.Item>
              <Form.Item label="Password" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                <Controller
                  name="password"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <Input type="password" {...field} placeholder="••••••••" />}
                />
              </Form.Item>
              {/* <Form.Item>
                <div className="flex items-center justify-between">
                  <Checkbox {...register('remember')}>Remember me</Checkbox>
                  <a href="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
                </div>
              </Form.Item> */}
              <Form.Item>
                <Button type="primary" htmlType="submit" className="w-full">Sign in</Button>
              </Form.Item>
              {/* <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don’t have an account yet? <a href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</a>
              </p> */}
            </Form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LoginPage