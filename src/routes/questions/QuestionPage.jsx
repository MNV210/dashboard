import React, { useEffect, useState } from 'react'
import { Table, message } from 'antd'
import { questionApi } from '../../api/questionApi'

function QuestionPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await questionApi.getQuestions()
        setData(response.data)
      } catch (error) {
        message.error('Failed to fetch questions')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Câu hỏi',
      dataIndex: 'question',
      key: 'question',
    },
    {
      title: 'Đáp án',
      dataIndex: 'answer',
      key: 'answer',
    },
  ]

  return (
    <div>
      <h2>Danh sách câu hỏi</h2>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} />
    </div>
  )
}

export default QuestionPage