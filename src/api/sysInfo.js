import request from '@/utils/request'

export function fetchPvSys(data) {
  return request({
    url: '/sysInfo/list',
    method: 'post',
    data
  })
}
export function updatePvSys(data) {
  return request({
    url: '/sysInfo/update',
    method: 'post',
    data
  })
}
