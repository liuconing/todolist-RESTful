import http from 'http'
export type sendResponseType = {
  res: http.ServerResponse
  status: 200 | 404
  body: any
}
export type todoType = { id: string; title: string }
export enum STATUS_CODE {
  success = 200,
  error = 404,
}
