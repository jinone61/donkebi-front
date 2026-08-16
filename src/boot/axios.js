import { defineBoot } from '#q-app'
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.donkebi.com',
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJoZXJvZHVvIiwiZXhwIjoxNzg3NDU3MDg4LCJpYXQiOjE3ODY4NTIyODgsInVzZXJJZCI6MX0.K8YOqDMBcn71mAyj_CD7S0RlQrXv7I82uHfWxc7VYY4`
  }
})
// const api = axios.create({ baseURL: 'http://localhost:8080' })

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api, axios }
