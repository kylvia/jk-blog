<template>
  <div class="createPost-container">
    <el-form class="form-container" :model="postForm" :rules="rules" ref="postForm">

      <sticky :className="'sub-navbar '+postForm.status">
        <template v-if="fetchSuccess">

          <router-link style="margin-right:15px;" v-show='isEdit' :to="{ path:'/form/create-form/'}">
            <el-button type="info">创建form</el-button>
          </router-link>

          <el-dropdown trigger="click">
            <el-button plain>{{!postForm.comment_disabled?'评论已打开':'评论已关闭'}}
              <i class="el-icon-caret-bottom el-icon--right"></i>
            </el-button>
            <el-dropdown-menu class="no-padding" slot="dropdown">
              <el-dropdown-item>
                <el-radio-group style="padding: 10px;" v-model="postForm.comment_disabled">
                  <el-radio :label="true">关闭评论</el-radio>
                  <el-radio :label="false">打开评论</el-radio>
                </el-radio-group>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm(0)">发布
          </el-button>
          <el-button v-loading="loading" type="warning" @click="submitForm(1)">草稿</el-button>

        </template>
        <template v-else>
          <el-tag>发送异常错误,刷新页面,或者联系程序员</el-tag>
        </template>

      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <el-col :span="21">
            <el-form-item style="margin-bottom: 40px;" prop="title">
              <MDinput name="name" v-model="postForm.title" required :maxlength="100">
                标题
              </MDinput>
              <span v-show="postForm.title.length>=26" class='title-prompt'>app可能会显示不全</span>
            </el-form-item>

            <div class="postInfo-container">
              <el-row>

                <el-col :span="8">
                  <el-form-item label-width="45px" label="分类:" class="postInfo-container-item">
                    <el-select clearable class="filter-item" @change="classesLiSelect" style="width: 130px" v-model="postForm.classes" placeholder="分类">
                      <el-option v-for="item in classesLIstOptions" :key="item.id" :label="item.name" :value="item.id">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label-width="80px" label="文章类型:" class="postInfo-container-item">
                    <el-select clearable class="filter-item" style="width: 130px" v-model="postForm.articleType" placeholder="类型">
                      <el-option v-for="item in articleTypes" :key="item.id" :label="item.name" :value="item.id">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>


                <el-col :span="8">
                  <el-form-item label-width="80px" label="发布时间:" class="postInfo-container-item">
                    <el-date-picker v-model="postForm.display_time" type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="选择日期时间">
                    </el-date-picker>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>

        <el-form-item style="margin-bottom: 40px;" label-width="45px" label="摘要:">
          <el-input type="textarea" class="article-textarea" :rows="1" autosize placeholder="请输入内容" v-model="postForm.content_short">
          </el-input>
          <span class="word-counter" v-show="contentShortLength">{{contentShortLength}}字</span>
        </el-form-item>

        <div class="editor-container">
          <tinymce :height=400 ref="editor" v-model="postForm.content"></tinymce>
        </div>

        <div style="margin-bottom: 20px;">
          <Upload v-model="postForm.image_uri"></Upload>
        </div>
      </div>
    </el-form>

  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import Upload from '@/components/Upload/singleImage3'
import MDinput from '@/components/MDinput'
import Multiselect from 'vue-multiselect'// 使用的一个多选框组件，element-ui的select不能满足所有需求
import 'vue-multiselect/dist/vue-multiselect.min.css'// 多选框组件css
import Sticky from '@/components/Sticky' // 粘性header组件
import { fetchArticle, fetchClasses, updateArticle, createArticle } from '@/api/article'

const defaultForm = {
  status: 'draft',
  title: '', // 文章题目
  content: '', // 文章内容
  content_short: '', // 文章摘要
  image_uri: '', // 文章图片
  display_time: undefined, // 前台展示时间
  id: undefined,
  comment_disabled: false
}

export default {
  name: 'articleDetail',
  components: { Tinymce, MDinput, Upload, Multiselect, Sticky },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
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
      classesLIstOptions: [],
      articleTypes: [{
        id: 0,
        name: '原创'
      }, {
        id: 1,
        name: '转载'
      }],
      rules: {
        image_uri: [{ validator: validateRequire }],
        title: [{ validator: validateRequire }],
        content: [{ validator: validateRequire }]
      }
    }
  },
  computed: {
    contentShortLength() {
      return this.postForm.content_short.length
    }
  },
  created() {
    this.getClasses()
    if (this.isEdit) {
      this.fetchData()
    } else {
      this.postForm = Object.assign({}, defaultForm)
    }
  },
  methods: {
    fetchData() {
      fetchArticle({ id: this.$route.params.id }).then(response => {
        this.postForm = response.data
        this.postForm.display_time = new Date(this.postForm.display_time * 1000)
        console.log(this.postForm)
      }).catch(err => {
        this.fetchSuccess = false
        console.log(err)
      })
    },
    getClasses() {
      fetchClasses().then(response => {
        this.classesLIstOptions = response.data
      })
    },
    submitForm(status) {
      const that = this
      // console.log(this.postForm.display_time)
      this.postForm.display_time = parseInt(this.postForm.display_time / 1000)
      this.postForm.id = this.$route.params.id
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          if (this.isEdit) {
            // 编辑
            updateArticle(that.postForm).then(function(response) {
              if (response.code !== 100) {
                that.$notify({
                  title: '失败',
                  message: '发布文章失败',
                  type: 'error',
                  duration: 2000
                })
                return
              }
              that.$notify({
                title: '成功',
                message: '发布文章成功',
                type: 'success',
                duration: 2000
              })
              that.$router.push({ path: '/example/table' })
            })
          } else {
            createArticle(that.postForm).then(function(response) {
              if (response.code !== 100) {
                that.$notify({
                  title: '失败',
                  message: '发布文章失败',
                  type: 'error',
                  duration: 2000
                })
                return
              }
              that.$notify({
                title: '成功',
                message: '发布文章成功',
                type: 'success',
                duration: 2000
              })
              that.$router.push({ path: '/example/table' })
            })
          }
          this.postForm.status = +status
          this.loading = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    draftForm() {
      if (this.postForm.content.length === 0 || this.postForm.title.length === 0) {
        this.$message({
          message: '请填写必要的标题和内容',
          type: 'warning'
        })
        return
      }
      this.$message({
        message: '保存成功',
        type: 'success',
        showClose: true,
        duration: 1000
      })
      this.postForm.status = 1
    },
    classesLiSelect() {
      const that = this
      const classesFi = this.classesLIstOptions.filter(function(item, index) {
        return (item.id === that.postForm.classes)
      })
      that.postForm.classesLabel = classesFi[0].name
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
</style>

