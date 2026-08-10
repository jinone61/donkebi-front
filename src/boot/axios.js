import { defineBoot } from '#q-app'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://3.38.133.139:8080' })
// const api = axios.create({ baseURL: 'http://localhost:8080' })

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api, axios }
