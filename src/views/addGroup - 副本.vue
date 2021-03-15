<template>
  <div>
    <div class="addGroup">
      <div class="addGroup_title dis_flex">
        <p>添加群组</p>
        <i class="el-icon-close" @click="cancelClick"></i>
      </div>
      <el-input placeholder="请输入" v-model="input" clearable>
        <span slot="prefix" class="group_name">群组名称</span>
      </el-input>
      <el-input
        placeholder="请输入配置空间(单位GB,最大值为500GB)"
        type="tel"
        v-model.number="input2"
        clearable
        oninput="if(value>500)value=500;value=value.replace(/[^\d]/g,'')"
        maxlength="3"
      >
        <span slot="prefix" class="group_name">配置空间</span>
        <!-- oninput="value=value.replace(/[^0-9.]/g,'')" 输入数字(可以带小数点)-->
      </el-input>
      <!-- 选择截至时间 -->
      <el-date-picker
        v-model="value3"
        type="datetime"
        :picker-options="pickerOptions"
        placeholder="选择截止时间"
        default-time="23:59:59"
        value-format="timestamp"
      ></el-date-picker>
      <!-- 树形结构穿梭框 -->
      <tree-transfer
        :title="title"
        :from_data="fromData"
        :to_data="toData"
        :defaultProps="{ label: 'label' }"
        @addBtn="add"
        @removeBtn="remove"
        mode="transfer"
        width="95%"
        height="500px"
        filter
      ></tree-transfer>

      <div class="submitBtn">
        <el-button @click="cancelClick">取消</el-button>
        <el-button type="primary" @click="submit()">提交</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import treeTransfer from "el-tree-transfer"; // 引入
export default {
  components: {
    treeTransfer
  },
  data() {
    return {
      input: "",
      input2: "",
      value3: "",
      title: ["选择部门或成员", "已选"],
      fromData: [],
      toData: [],
      obj: [],
      addDocId: "", // 请求创建群组文档成功后返回的id
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        }
      }
    };
  },
  created() {
    this.rootHilum();
  },
  methods: {
    //点击取消和X跳转页面
    cancelClick() {
      this.$router.go(-1);
    },
    // 添加
    submit() {
      let params = {},
        that = this;
      params["name"] = this.input;
      params["quota"] = this.input2 * 1024 * 1024* 1024;
      this.$axios
        .post("/api/v1/groupdoc/add", JSON.stringify(params))
        .then(res => {
          if (res.data.docid) {
            that.addDocId = res.data.docid;
            that.groupdocAddUser();
          } else {
            this.$message("群组文档创建失败");
          }
        });
    },
    async rootHilum() {
      this.fromData = await this.xxxx();
    },

    async xxxx(depid = 0) {
      let arr = [];
      if (depid === 0) {
        let arr1 = await this.g();
        for (const i1 in arr1) {
          arr.push({
            id: arr1[i1].depid,
            pid: 0,
            label: arr1[i1].name,
            children: await this.xxxx(arr1[i1].depid)
          });
        }
      } else {
        let arr3 = await this.yh(depid);
        for (const i3 in arr3) {
          arr.push({
            id: arr3[i3].userid,
            pid: depid,
            label: arr3[i3].name
          });
        }

        let arr2 = await this.bm(depid);
        for (const i2 in arr2) {
          if (arr2[i2].name != "山西省") {
            arr.push({
              id: arr2[i2].depid,
              pid: depid,
              label: arr2[i2].name,
              children: await this.xxxx(arr2[i2].depid)
            });
          }
        }
      }
      return arr;
    },

    // 将用户添加到群组文档
    groupdocAddUser() {
      let that = this,
        toData = this.obj.nodes,
        arr = [];
      toData.forEach((item, index) => {
        if (!item.children) {
          // 跳过包含children子节点的部门
          // 创建目录的接口
          this.$axios
            .post(
              "/api/v1/dir/create",
              JSON.stringify({
                docid: that.addDocId,
                name: item.label
              })
            )
            .then(res => {
              let userDocId = res.data.docid; // 张三文件夹创建成功后的文件夹id
              let uid = item.id; // 学生id
              // 权限分享
              let params = {};
              params["docid"] = userDocId;
              params["perminfos"] = [
                {
                  accessorid: item.id,
                  accessortype: "user",
                  denyvalue: 0,
                  allowvalue: 31,
                  endtime: that.value3 * 1000
                }
              ];
              params["inherit"] = true;

              // 权限分享接口
              params["docid"] = that.addDocId;
              that.$axios.post("/api/v1/perm2/set", JSON.stringify(params)); // 分享群组文件夹到学生
              params["docid"] = userDocId;
              params["inherit"] = false;
              that.$axios.post("/api/v1/perm2/set", JSON.stringify(params)); // 分享学生文件夹到学生

              // 给学生文件夹绑定学生id标签
              that.$axios
                .post(
                  "/api/v1/file/addtag",
                  JSON.stringify({
                    docid: userDocId,
                    tag: uid
                  })
                )
                .then(res => {
                  // 给学生文件夹绑定权限有效期标签
                  that.$axios.post(
                    "/api/v1/file/addtag",
                    JSON.stringify({
                      docid: userDocId,
                      tag: that.value3.toString()
                    })
                  );
                });

              that.$message({
                type: "success",
                message: "添加" + item.label + "目录成功"
              });
            });
        }
      });

      that.$router.replace("/index/groupManagement");
    },
    add(fromData, toData, obj) {
      console.log("fromData:", fromData);
      console.log("toData:", toData);
      console.log("obj:", obj);
      this.obj = obj;
    },
    remove(fromData, toData, obj) {
      console.log("fromData:", fromData);
      console.log("toData:", toData);
      console.log("obj:", obj);
    },

    // 根
    async g() {
      let res = await this.$axios.post("/api/v1/department/getroots");
      return res.data.depinfos;
    },
    // 部门
    async bm(depid) {
      let res = await this.$axios.post(
        "/api/v1/department/getsubdeps",
        JSON.stringify({ depid })
      );
      return res.data.depinfos;
    },
    // 用户
    async yh(depid) {
      let res = await this.$axios.post(
        "/api/v1/department/getsubusers",
        JSON.stringify({ depid })
      );
      return res.data.userinfos;
    },
    async fx(docid){
      let res = await this.$axios.post("/api/v1/perm2/set",JSON.stringify({ docid }));
    }
  }
};
</script>

<style scoped lang="scss">
.addGroup {
  width: 900px;
  margin: auto;
  background-color: #fff;

  .addGroup_title {
    height: 50px;
    background-color: #0079fe;

    p {
      color: #fff;
      padding-left: 20px;
    }
  }
}

.el-input,
.el-date-picker {
  width: 95%;
  margin-top: 20px;
  left: 22px;
}

.group_name {
  color: #696b6f;
  line-height: 40px;
  padding-left: 15px;
}

::v-deep .el-input--prefix .el-input__inner {
  padding-left: 100px;
}

::v-deep .el-date-editor--datetime .el-input__inner {
  padding-left: 30px;
}

.el-icon-close {
  color: #fff;
  font-size: 18px;
  padding-right: 20px;
}

.wl-transfer {
  margin: 20px auto 0;
}

.submitBtn {
  text-align: right;
  padding: 22px;
}

.wl-transfer .transfer-title {
  background-color: #f2f2f2;
}

::v-deep .wl-transfer .transfer-left {
  width: 45%;
}

::v-deep .wl-transfer .transfer-right {
  width: 45%;
}

//隐藏箭头
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
