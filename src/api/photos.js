import request from '@/utils/request'

export function fetchPhotos(data) {
  return request({
    url: '/photos/list',
    method: 'get',
    data
  })
}
export function insertPhotos(data) {
  return request({
    url: '/photos/insert',
    method: 'post',
    data
  })
}
export function deletePhotos(data) {
  return request({
    url: '/photos/delete',
    method: 'post',
    data
  })
}
