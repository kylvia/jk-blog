import request from '@/utils/request'

export function classesSearch(name) {
  return request({
    url: '/search/classes',
    method: 'get',
    params: { name }
  })
}
