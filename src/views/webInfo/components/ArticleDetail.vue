<template>
  <div class="createPost-container">
    <el-form class="form-container" :model="postForm" :rules="rules" ref="postForm">

      <sticky class="sub-navbar">
        <template v-if="fetchSuccess">

          <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm()">发布
          </el-button>
          <el-button v-loading="loading" type="warning" @click="refresh">取消</el-button>

        </template>
        <template v-else>
          <el-tag>发送异常错误,刷新页面,或者联系程序员</el-tag>
        </template>

      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <el-col :span="12">
            <el-form-item style="margin-bottom: 40px;" prop="sysName">
              <MDinput name="name" v-model="postForm.sysName" required :maxlength="100">
                网站名称
              </MDinput>
              <span v-show="postForm.sysName.length>=26" class='title-prompt'>app可能会显示不全</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item style="margin-bottom: 40px;" prop="motto">
              <MDinput name="name" v-model="postForm.motto" required :maxlength="100">
                座右铭
              </MDinput>
              <span v-show="postForm.motto.length>=26" class='title-prompt'>app可能会显示不全</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!--<el-row>
          <el-col :span="24">
            <el-form-item style="margin-bottom: 40px;" prop="aboutMe">
              <MDinput name="name" v-model="postForm.aboutMe" required :maxlength="100">
                关于我
              </MDinput>
            </el-form-item>
          </el-col>
        </el-row>-->
        <el-form-item style="margin-bottom: 40px;" prop="aboutMe">
          <label class="setLabel">关于我</label>
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4}"
            placeholder="请输入内容"
            v-model="postForm.aboutMe" required>
          </el-input>
        </el-form-item>

        <el-row>
          <el-col :span="12">
            <el-form-item style="margin-bottom: 40px;">
              <label class="settingName">头像</label><br>
              <pan-thumb :image="postForm.avatar"></pan-thumb>

              <el-button type="primary" icon="upload" style="position: absolute;bottom: 15px;margin-left: 40px;" @click="imagecropperShow=true">Change avatar
              </el-button>

              <image-cropper :width="300" :height="300" :url="imgAction" @close='close' @crop-upload-success="cropSuccess" langType="en"
                             :key="imagecropperKey" v-show="imagecropperShow"></image-cropper>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>

  </div>
</template>

<script>
import Upload from '@/components/Upload/singleImage3'
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件
import { fetchPvSys, updatePvSys } from '@/api/sysInfo'
import ImageCropper from '@/components/ImageCropper'
import PanThumb from '@/components/PanThumb'
import store from '@/store'

const defaultForm = {
  sysName: '', // 系统名称
  motto: '', // 座右铭
  aboutMe: '', // 座右铭
  avater: '', // 座右铭
  id: undefined
}

export default {
  name: 'articleDetail',
  components: { MDinput, Upload, Sticky, ImageCropper, PanThumb },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + '为必传项',
          type: 'error'
        })
        callback(null)
      } else {
        callback()
      }
    }
    return {
      postForm: Object.assign({}, defaultForm),
      fetchSuccess: true,
      loading: false,
      imagecropperShow: false,
      imagecropperKey: 0,
      rules: {
        avater: [{ validator: validateRequire }],
        sysName: [{ validator: validateRequire }],
        motto: [{ validator: validateRequire }],
        aboutMe: [{ validator: validateRequire }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  computed: {
    imgAction() {
      return ('/articleFront/upload')
    }

  },
  methods: {
    fetchData() {
      fetchPvSys({ userName: store.getters.name }).then(response => {
        this.postForm = response.data
      }).catch(err => {
        this.fetchSuccess = false
        console.log(err)
      })
    },
    submitForm() {
      console.log(this.postForm)
      this.postForm.userName = store.getters.name
      const that = this
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          updatePvSys(this.postForm).then(response => {
            this.loading = false
            if (response.code !== 100) {
              that.$notify({
                title: '失败',
                message: '修改失败',
                type: 'error',
                duration: 2000
              })
              return
            }
            that.$notify({
              title: '成功',
              message: '修改成功',
              type: 'success',
              duration: 2000
            })
          }).catch(err => {
            this.loading = false
            this.fetchSuccess = false
            console.log(err)
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    refresh() {
      window.location.reload()
    },

    cropSuccess(resData) {
      debugger
      console.log(resData)
      this.imagecropperShow = false
      this.imagecropperKey = this.imagecropperKey + 1
      this.postForm.avater = resData.files.avatar
    },
    close() {
      this.imagecropperShow = false
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "src/styles/mixin.scss";
  .title-prompt{
    position: absolute;
    right: 0px;
    font-size: 12px;
    top:10px;
    color:#ff4949;
  }
  .settingName{
    font-size: 16px;
    font-weight: bold;
    color: #9E9E9E;
  }
  .createPost-container {
    position: relative;
    .createPost-main-container {
      padding: 40px 45px 20px 50px;
      .postInfo-container {
        position: relative;
        @include clearfix;
        margin-bottom: 10px;
        .postInfo-container-item {
          float: left;
        }
      }
      .editor-container {
        min-height: 500px;
        margin: 0 0 30px;
        .editor-upload-btn-container {
            text-align: right;
            margin-right: 10px;
            .editor-upload-btn {
                display: inline-block;
            }
        }
      }
    }
    .word-counter {
      width: 40px;
      position: absolute;
      right: -10px;
      top: 0px;
    }
  }
  .avatar{
    width: 200px;
    height: 200px;
    border-radius: 50%;
  }
  .el-form-item.is-success .el-textarea__inner{
    border-color: transparent;
  }
  .setLabel{
    color: #9E9E9E;
    font-size: 18px;
    font-weight: 500;
  }
</style>

