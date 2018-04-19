import request from '@/utils/request'

export function fetchPvSys() {
  return request({
    url: '/sysInfo/list', // 假地址 自行替换
    method: 'get'
  })
}
