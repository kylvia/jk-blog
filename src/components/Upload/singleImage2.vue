<template>
  <div class="singleImageUpload2 upload-container">
    <div v-if="loading" class="loadMaks">
      <i class="el-icon-loading"></i>
      <p>上传中......</p>
    </div>
    <el-upload class="image-uploader" :data="dataObj" drag :multiple="false" :show-file-list="false" :action="imgAction" :before-upload="beforeUpload"
      :on-success="handleImageScucess">
      <i v-if="!loading" class="el-icon-upload"></i>
      <div v-if="!loading" class="el-upload__text">Drag或<em>点击上传</em></div>
    </el-upload>
    <!--<div v-show="imageUrl.length>0" class="image-preview">
      <div class="image-preview-wrapper" v-show="imageUrl.length>1">
        <img :src="imageUrl">
        <div class="image-preview-action">
          <i @click="rmImage" class="el-icon-delete"></i>
        </div>
      </div>
    </div>-->
  </div>
</template>

<script>
// import { getToken } from '@/api/qiniu'

export default {
  name: 'singleImageUpload2',
  props: {
    value: String
  },
  computed: {
    imageUrl() {
      return this.value
    },

    imgAction() {
      return (process.env.BASE_API + '/articleFront/upload')
    }
  },
  data() {
    return {
      tempUrl: '',
      loading: false,
      dataObj: { token: '', key: '' }
    }
  },
  methods: {
    rmImage() {
      this.emitInput('')
    },
    emitInput(val) {
      // this.$emit('input', val)
      this.$emit('uploadSuccess', val)
    },
    handleImageScucess(file) {
      this.loading = false
      this.emitInput(file)
    },
    beforeUpload() {
      this.loading = true
      /* const _self = this
      return new Promise((resolve, reject) => {
        getToken().then(response => {
          const key = response.data.qiniu_key
          const token = response.data.qiniu_token
          _self._data.dataObj.token = token
          _self._data.dataObj.key = key
          this.tempUrl = response.data.qiniu_url
          resolve(true)
        }).catch(() => {
          reject(false)
        })
      })*/
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.upload-container{
  width: 50%;
  height: 100%;
  margin: 10px auto;
  position: relative;
  .image-uploader {
    height: 100%;
  }
  .loadMaks {
    position: absolute;
    height: 100%;
    width: 100%;
    padding-top: 30px;
    background-color: rgba(0,0,0,.2);
    z-index: 9;
    text-align: center;
    font-size: 32px;
    color: rgb(64, 158, 255);
  }

  .image-preview {
    width: 320px;
    height: 180px;
    position: absolute;
    left: 0px;
    top: 0px;
    border: 1px dashed #d9d9d9;
    .image-preview-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .image-preview-action {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      cursor: default;
      text-align: center;
      color: #fff;
      opacity: 0;
      font-size: 20px;
      background-color: rgba(0, 0, 0, .5);
      transition: opacity .3s;
      cursor: pointer;
      text-align: center;
      line-height: 200px;
      .el-icon-delete {
        font-size: 36px;
      }
    }
    &:hover {
      .image-preview-action {
        opacity: 1;
      }
    }
  }
}
</style>
