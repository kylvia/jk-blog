<template>
    <div>
      <div class="toolBar">
        <div style="margin-bottom: 20px;">
          <Upload v-model="imgurl" @uploadSuccess="cropSuccess"></Upload>
        </div>
      </div>
      <div>
        <div v-for="(items,ind) in list" :key="ind">
          <h2 class="timeTitle">{{items.time}}</h2>
          <div  class="imgBox">
            <div v-for="(item,index) in items.photos" :key="index" class="imgItem" :class="{'curItem': (item.ind === isActiveNum)}">
              <img :src="item.src" @click="showBigImage(item.src, item.ind)">
              <div class="image-preview-action">
                <i @click="rmImage(item._id, item.ind)" class="el-icon-delete"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-dialog :visible.sync="dialogTableVisible"
                 center
                 @close="handleClose"
                 @keyup.left.native="preBtnClick"
                 @keyup.right.native ="nextBtnClick"
                 custom-class="imgWin">
        <div @click="preBtnClick" class="preBtn controlBtn">
          <i class="el-icon-arrow-left"></i>
        </div>
        <div class="imgPreview">
          <img :src="curUrl">
        </div>
        <div @click="nextBtnClick" class="nextBtn controlBtn">
          <i class="el-icon-arrow-right"></i>
        </div>
      </el-dialog>
    </div>
</template>

<script>
import { parseTime } from '@/utils'
import { fetchPhotos, insertPhotos, deletePhotos } from '@/api/photos'
import Upload from '@/components/Upload/singleImage2'
export default {
  name: '',
  components: { Upload },
  data() {
    return {
      list: [],
      imgurl: '',
      isActiveId: '',
      curUrl: '', // 当前选中的图片src
      dialogTableVisible: false,
      isActiveNum: -1 // 当前选中的图片序号
    }
  },
  created() {
    this.fetchData()
    const component = this
    document.onkeydown = function(e) {
      if (!component.dialogTableVisible) {
        return
      }
      if (e.keyCode === 39) {
        component.nextBtnClick()
      } else if (e.keyCode === 37) {
        component.preBtnClick()
      }
    }
  },
  filters: {
    parseTime(filterVal, jsonData) {
      return parseTime(filterVal, jsonData)
    }
  },
  computed: {
    imgAction() {
      return ('/articleFront/upload')
    }

  },
  methods: {
    rmImage(id, index) {
      const that = this
      that.isActiveNum = index
      that.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        that.isActiveNum = -1
        deletePhotos({ id: id }).then(response => {
          if (response.code === 100) {
            that.$message({
              type: 'success',
              message: '删除成功!'
            })
            that.fetchData()
          } else {
            that.$notify({
              title: '失败',
              message: response.msg,
              type: 'error',
              duration: 2000
            })
          }
        }).catch(err => {
          that.fetchSuccess = false
          console.log(err)
        })
      }).catch(() => {
        that.isActiveNum = -1
        that.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    showBigImage(url, index) {
      const that = this
      that.isActiveNum = index
      that.dialogTableVisible = true
      that.curUrl = url
      /* that.$alert(`<div class="imgPreview"><div @click="preBtnClick(index})" class="preBtn"><i class="el-icon-arrow-left"></i></div><img style="width: 100%;" src="${that.curUrl}" alt=""><div @click="nextBtnClick(${index})" class="nextBtn"><i class="el-icon-arrow-right"></i></div></div>`, '', {
        dangerouslyUseHTMLString: true,
        showConfirmButton: false,
        customClass: 'imgWin',
        callback: function() {
          that.isActiveNum = -1
        }
      })
      that.$alert(`<el-carousel :interval="5000" arrow="always">
          <el-carousel-item v-for="item in ${that.list}" :key="item">
            <div><img style="width: 100%;" src="${url}" alt=""></div>
          </el-carousel-item>
        </el-carousel>`, '', {
        dangerouslyUseHTMLString: true,
        showConfirmButton: false,
        customClass: 'imgWin',
        callback: function() {
          that.isActiveNum = -1
        }
      })*/
    },
    fetchData() {
      const that = this
      fetchPhotos().then(response => {
        that.list = response.data
      }).catch(err => {
        this.fetchSuccess = false
        console.log(err)
      })
    },
    preBtnClick() {
      const that = this
      const curInd = this.isActiveNum
      const listItem = this.list[this.list.length - 1]
      const len = listItem.photos[listItem.photos.length - 1].ind
      if (curInd > 0) {
        that.isActiveNum = curInd - 1
      } else {
        that.isActiveNum = len
      }
      that.list.map((items) => {
        items.photos.map(function(item) {
          item.ind === that.isActiveNum && (that.curUrl = item.src)
        })
      })
    },
    nextBtnClick() {
      const curInd = this.isActiveNum
      const that = this
      const listItem = this.list[this.list.length - 1]
      const len = listItem.photos[listItem.photos.length - 1].ind
      if (curInd >= len) {
        that.isActiveNum = 0
      } else {
        that.isActiveNum = curInd + 1
      }
      that.list.map((items) => {
        items.photos.map(function(item) {
          item.ind === that.isActiveNum && (that.curUrl = item.src)
        })
      })
    },
    cropSuccess(resData) {
      const that = this
      if (resData.code === 100) {
        insertPhotos({ imgUrl: resData.data.imgUrl }).then(response => {
          if (response.code !== 100) {
            that.$notify({
              title: '失败',
              message: response.msg,
              type: 'error',
              duration: 2000
            })
            return
          }
          that.fetchData()
          that.$notify({
            title: '成功',
            message: response.msg,
            type: 'success',
            duration: 2000
          })
        }).catch(err => {
          console.log(err)
        })
      } else {
        that.$notify({
          title: '失败',
          message: resData.msg,
          type: 'error',
          duration: 2000
        })
        return
      }
    },
    handleClose() {
      console.log('handleClose')
      this.isActiveNum = -1
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>

  .imgBox{
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    .imgItem{
      position: relative;
      width: 18%;
      height: 240px;
      line-height: 240px;
      text-align: center;
      overflow: hidden;
      margin: 5px 1%;
      border: 1px solid #dcdcdc;
      border-radius: 5px;
      padding: 5px;
      img{
        max-width: 100%;
      }
      .image-preview-action {
        position: absolute;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        right: -50px;
        top:  -50px;
        cursor: default;
        text-align: center;
        color: #fff;
        opacity: 0;
        font-size: 20px;
        background-color: rgba(0, 0, 0, .7);
        transition: opacity .3s;
        cursor: pointer;
        text-align: center;
        line-height: 200px;
        .el-icon-delete {
          font-size: 36px;
          position: absolute;
          top: 54px;
          right: 50px;
        }
      }
      &:hover {
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
        background-color: rgba(0,0,0,.5);
        .image-preview-action {
          opacity: 1;
        }
      }
      &.curItem {
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
        background-color: rgba(0,0,0,.5);
      }
    }
  }
  .controlBtn{
    position: absolute;
    width: 15px;
    top: 48%;
    i{
      font-size: 64px;
      font-weight: 700;
      cursor: pointer;
      &:hover{
        color: #333333;
      }
    }
  }
  .imgPreview{
    text-align: center;

    background: rgba(0,0,0,05);
    img{
      max-width: 100%;
    }

  }
  .preBtn{
    left: -200px;
  }
  .nextBtn{
    right: -200px;
  }
  .timeTitle{
    padding-left: 20px;
  }
</style>
