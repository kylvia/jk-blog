<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" :placeholder="$t('table.title')" v-model="listQuery.title">
      </el-input>
      <el-select clearable @change='handleFilter' class="filter-item" style="width: 130px" v-model="listQuery.classes" placeholder="分类">
        <el-option v-for="item in calendarTypeOptions" :key="item.id" :label="item.name" :value="item.id">
        </el-option>
      </el-select>
      <el-select @change='handleFilter' style="width: 140px" class="filter-item" v-model="listQuery.sort">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">{{$t('table.search')}}</el-button>
      <router-link style="margin-right:15px;" :to="{ path:'/form/create-form'}">
        <!--<el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">{{$t('table.add')}}</el-button>-->
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit">{{$t('table.add')}}</el-button>
      </router-link>

    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">
      <!--<el-table-column align="center" :label="$t('table.id')" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>-->
      <el-table-column width="150px" align="center" :label="$t('table.date')">
        <template slot-scope="scope">
          <span>{{scope.row.display_time | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150px" :label="$t('table.title')">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{scope.row.title}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="分类">
        <template slot-scope="scope">
          <span>{{scope.row.classesLabel}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('table.readings')" width="95">
        <template slot-scope="scope">
          <span v-if="scope.row.pageviews" class="link-type" @click='handleFetchPv(scope.row.pageviews)'>{{scope.row.pageviews}}</span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" :label="$t('table.status')" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusStyleFilter">{{scope.row.status | statusFilter}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('table.actions')" width="330" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <router-link :to="{ path:'/form/edit-form/'+scope.row.id}">
            <!--<el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{$t('table.edit')}}</el-button>-->
            <el-button type="primary" size="mini">{{$t('table.edit')}}</el-button>
          </router-link>
          <el-button v-if="scope.row.status!=0" size="mini" type="success" @click="handleModifyStatus(scope.row,0)">{{$t('table.publish')}}
          </el-button>
          <el-button v-if="scope.row.status!=1" size="mini" @click="handleModifyStatus(scope.row,1)">{{$t('table.draft')}}
          </el-button>
          <el-button size="mini" type="danger" @click="deleteRow(scope.row)">{{$t('table.delete')}}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>


    <el-dialog title="Reading statistics" :visible.sync="dialogPvVisible">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel"> </el-table-column>
        <el-table-column prop="pv" label="Pv"> </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{$t('table.confirm')}}</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList, fetchPv, fetchClasses, updateStatus, deleteStatus } from '@/api/article'
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'

export default {
  name: 'complexTable',
  directives: {
    waves
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        classes: undefined,
        classesLabel: undefined,
        title: undefined,
        sort: '+id'
      },
      calendarTypeOptions: [],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      temp: {
        id: undefined,
        remark: '',
        display_time: new Date(),
        title: '',
        status: 0
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        display_time: [{ type: 'date', required: true, message: 'display_time is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      }
    }
  },
  filters: {
    statusStyleFilter(status) {
      const statusMap = {
        0: 'success',
        1: 'info',
        2: 'danger'
      }
      return statusMap[status]
    },
    statusFilter(status) {
      const statusMap = {
        0: '发布',
        1: '草稿'
      }
      return statusMap[status]
    }
  },
  computed: {
    classesFilter(classes) {
      let classesVal = ''
      console.log(this.calendarTypeOptions)
      this.calendarTypeOptions.map(function(item, index) {
        if (+item.value === classes) {
          classesVal = item.name
          return false
        }
      })
      return classesVal
    }
  },
  created() {
    this.getList()
    this.getClasses()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },
    getClasses() {
      fetchClasses().then(response => {
        console.log(response.data)
        this.calendarTypeOptions = response.data
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    handleModifyStatus(row, status) {
      const that = this
      let tips = ''
      tips = (+status ? '发布' : '存为草稿')
      updateStatus({ id: row.id, status: status }).then(function(response) {
        if (response.code !== 100) {
          that.$notify({
            title: '失败',
            message: tips + '失败',
            type: 'error',
            duration: 2000
          })
          return
        }
        row.status = status
        that.$message({
          title: '成功',
          message: tips + '成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    deleteRow(row) {
      const that = this
      deleteStatus({ id: row.id }).then(function(response) {
        if (response.code !== 100) {
          that.$notify({
            title: '失败',
            message: response.msg,
            type: 'error',
            duration: 2000
          })
          return
        }
        row.status = status
        that.$message({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        that.getList()
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        remark: '',
        display_time: new Date(),
        title: '',
        status: 0,
        type: ''
      }
    },
    handleDelete(row) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'display_time') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
