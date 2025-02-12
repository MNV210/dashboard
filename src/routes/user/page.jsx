import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Typography, Spin } from 'antd'
import { userApi } from '../../api/userApi'
// import '../../assets/scss/user.scss'

const { Option } = Select;

function UserPage() {
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [form] = Form.useForm()
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deletingUserId, setDeletingUserId] = useState(null)

    const getUsers = async () => {
        setIsLoading(true) // Set loading state to true when fetching users
        try {
            const response = await userApi.getUsers()
            setUsers(response.data)
        } catch (error) {
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getUsers()
    }, [])

    const handleEdit = (user) => {
        setEditingUser(user)
        form.setFieldsValue(user)
        setIsModalOpen(true)
    }

    const handleDelete = async () => {
        try {
            await userApi.deleteUser(deletingUserId)
            setUsers(users.filter(user => user.id !== deletingUserId))
            message.success('User deleted successfully')
            setIsDeleteModalOpen(false)
            setDeletingUserId(null)
        } catch (error) {
        }
    }

    const showDeleteModal = (userId) => {
        setDeletingUserId(userId)
        setIsDeleteModalOpen(true)
    }

    const handleCreate = () => {
        setEditingUser(null)
        form.resetFields()
        setIsModalOpen(true)
    }

    const handleOk = async () => {
        try {
            const values = await form.validateFields()
            const isUnique = (field, value) => !users.some(user => user[field] === value && (!editingUser || user.id !== editingUser.id))

            if (!isUnique('email', values.email)) {
                message.error('Email must be unique')
                return
            }
            if (!isUnique('username', values.username)) {
                message.error('Username must be unique')
                return
            }
            if (!isUnique('phone', values.phone)) {
                message.error('Phone number must be unique')
                return
            }

            if (editingUser) {
                await userApi.updateUser(editingUser.id, values)
                setUsers(users.map(user => user.id === editingUser.id ? { ...user, ...values } : user))
                message.success('User updated successfully')
            } else {
                await userApi.createUser(values)
                await getUsers() // Reload users after creating a new user
                message.success('User created successfully')
            }
            setIsModalOpen(false)
            setEditingUser(null)
        } catch (error) {
            message.success('Error saving user')
        }
    }

    const handleCancel = () => {
        setIsModalOpen(false)
        setEditingUser(null)
    }

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false)
        setDeletingUserId(null)
    }

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <>
                    <Button onClick={() => handleEdit(record)}>Edit</Button>
                    <Button onClick={() => showDeleteModal(record.id)} danger>Delete</Button>
                </>
            ),
        },
        // Add more columns as needed
    ]

    return (
        <>
            <div className='flex justify-between items-center mb-5'>
                <Typography.Title level={2}>Users</Typography.Title>
                <Button style={{float:'left'}} className='button_create_user' type="primary" onClick={handleCreate}>Create User</Button>
            </div>
            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Table dataSource={users} columns={columns} rowKey="id" />
            )}
            <Modal title={editingUser ? "Edit User" : "Create User"} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the name!' }]}>
                        <Input placeholder="Enter name" />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please input the email!' }, { type: 'email', message: 'Please enter a valid email!' }]}>
                        <Input placeholder="Enter email" />
                    </Form.Item>
                    <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Please input the username!' }]}>
                        <Input placeholder="Enter username" />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Please input the phone number!' }]}>
                        <Input placeholder="Enter phone number" />
                    </Form.Item>
                    {!editingUser && (
                        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please input the password!' }]}>
                            <Input.Password placeholder="Enter password" />
                        </Form.Item>
                    )}
                    <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select a role!' }]}>
                        <Select placeholder="Select role">
                            <Option value="super admin">Super Admin</Option>
                            <Option value="admin">Admin</Option>
                            <Option value="user">User</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal title="Confirm Delete" open={isDeleteModalOpen} onOk={handleDelete} onCancel={handleDeleteCancel}>
                <p>Are you sure you want to delete this user?</p>
            </Modal>
        </>
    )
}

export default UserPage