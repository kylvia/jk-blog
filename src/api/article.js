import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/article/list',
    method: 'get',
    params: query
  })
}

export function fetchClasses() {
  return request({
    url: '/article/classesList',
    method: 'get'
  })
}

export function fetchArticle(query) {
  return request({
    url: '/article/detail',
    method: 'get',
    params: query
  })
}

export function fetchPv(pv) {
  return request({
    url: '/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/article/create',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/article/update',
    method: 'post',
    data
  })
}

export function updateStatus(data) {
  return request({
    url: '/article/updateStatus',
    method: 'post',
    data
  })
}

export function deleteStatus(data) {
  return request({
    url: '/article/delete',
    method: 'post',
    data
  })
}
