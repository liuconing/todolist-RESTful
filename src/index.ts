import http from 'http'
import { v4 as uuidv4 } from 'uuid'
import { type sendResponseType, type todoType, STATUS_CODE } from './type'
let todos: todoType[] = []
const headers = {
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
  'Content-Type': 'application/json',
}

const sendResponse = ({ res, status, body }: sendResponseType) => {
  res.writeHead(status, headers)
  res.write(JSON.stringify(body))
  res.end()
}
const parseRequestBody = (res, body: string) => {
  try {
    return JSON.parse(body)
  } catch (error) {
    sendResponse({
      res,
      status: STATUS_CODE.error,
      body: { success: false, data: [], message: error.message },
    })
    return null
  }
}
const handleGetRequest = (req, res) => {
  const UID = req.url.split('/').pop()

  if (UID === 'todos') {
    sendResponse({
      res,
      status: STATUS_CODE.success,
      body: { success: true, data: todos, length: todos.length },
    })
  } else {
    const filterIndex = todos.findIndex((item) => item.id === UID)
    if (filterIndex >= 0) {
      sendResponse({
        res,
        status: STATUS_CODE.success,
        body: { success: true, data: todos[filterIndex], length: todos.length },
      })
    } else {
      sendResponse({
        res,
        status: STATUS_CODE.success,
        body: { success: true, data: [], message: '沒有這筆資料' },
      })
    }
  }
}

// 處理POST請求
const handlePostRequest = (res, body) => {
  const todoData = parseRequestBody(res, body)
  if (todoData === null) return
  if (todoData?.title) {
    const newTodo: todoType = {
      id: uuidv4(),
      title: todoData.title,
    }
    todos.push(newTodo)

    sendResponse({
      res,
      status: STATUS_CODE.success,
      body: { success: true, data: newTodo },
    })
  } else {
    sendResponse({
      res,
      status: STATUS_CODE.error,
      body: { success: false, message: 'title 欄位未填寫正確或者不可為空' },
    })
  }
}

// 處理DELETE請求
const handleDeleteRequest = (req, res) => {
  const UID = req.url.split('/').pop()
  const filterIndex = todos.findIndex((item) => item.id === UID)

  if (UID === 'todos') {
    todos.length = 0
    sendResponse({
      res,
      status: STATUS_CODE.success,
      body: { success: true, data: todos },
    })
  } else if (filterIndex !== -1) {
    todos.splice(filterIndex, 1)
    sendResponse({
      res,
      status: STATUS_CODE.success,
      body: { success: true, data: todos },
    })
  } else {
    sendResponse({
      res,
      status: STATUS_CODE.error,
      body: { success: false, message: '不存在這筆資料' },
    })
  }
}

// 處理PATCH請求
const handlePatchRequest = (req, res, body) => {
  const UID = req.url.split('/').pop()
  const todoData = parseRequestBody(res, body)
  const filterIndex = todos.findIndex((item) => item.id === UID)
  if (todoData === null) return
  if (todoData?.title) {
    if (filterIndex !== -1) {
      todos[filterIndex].title = todoData.title
      sendResponse({
        res,
        status: STATUS_CODE.success,
        body: { success: true, data: todos },
      })
    } else {
      sendResponse({
        res,
        status: STATUS_CODE.error,
        body: { success: false, message: '不存在這筆資料' },
      })
    }
  } else {
    sendResponse({
      res,
      status: STATUS_CODE.error,
      body: { success: false, message: 'title 欄位未填寫正確或者不可為空' },
    })
  }
}

const requestListener = (req, res) => {
  let parseRequestBody = ''
  req.on('data', (chunk: string) => {
    parseRequestBody += chunk
  })

  if (req.url.startsWith('/todos')) {
    req.on('end', () => {
      switch (req.method) {
        case 'GET':
          handleGetRequest(req, res)
          break
        case 'POST':
          handlePostRequest(res, parseRequestBody)
          break
        case 'DELETE':
          handleDeleteRequest(req, res)
          break
        case 'PATCH':
          handlePatchRequest(req, res, parseRequestBody)
          break
        default:
          sendResponse({
            res,
            status: STATUS_CODE.error,
            body: { success: false, message: '不支持的請求方法' },
          })
      }
    })
  } else {
    sendResponse({
      res,
      status: STATUS_CODE.error,
      body: { success: false, data: [], message: 'not font' },
    })
  }
}

const server = http.createServer(requestListener)

export default server
