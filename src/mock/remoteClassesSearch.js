import Mock from 'mockjs'
import { param2Obj } from '@/utils'

const NameList = []
const count = 100

for (let i = 0; i < count; i++) {
  NameList.push(Mock.mock({
    name: '@first',
    'id|+1': 2
  }))
}
NameList.push({ name: '前端', id: 1 })

export default {
  searchClasses: config => {
    debugger
    const { name } = param2Obj(config.url)
    const mockNameList = NameList.filter(item => {
      const lowerCaseName = item.name.toLowerCase()
      if (name && lowerCaseName.indexOf(name.toLowerCase()) < 0) return false
      return true
    })
    return { items: mockNameList }
  }
}
