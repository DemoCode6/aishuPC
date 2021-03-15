<template>
	<div>
		<div class="dis_flex top_mb min_w">
			<bread-crumb></bread-crumb>
			<el-button type="primary" @click="addGroup" size="medium" icon="el-icon-plus" v-if="role()">添加群组</el-button>
		</div>

		<!-- 群组文档手风琴效果 -->
		<el-collapse v-model="activeNames" @change="handleChange" style="min-width:800px">
			<el-collapse-item title="个人文档类型" name="1">
				<ul>
					<li class="dis_flex group_file" v-for="item in group_file" :key="this" @click="jump(item.docid, item.name)">
						<div class="dis_flex group_file_left">
							<i class="el-icon-folder-opened group_file_name"></i>
							<p class="group_file_name">{{item.name}}</p>
							<!-- 使用时间戳的过滤器 -->
							<span>{{item.editor}}最后修改于 ({{item.modified/1000|moment}})</span>
						</div>
						<div class="group_file_right"  v-if="role()">
							<el-popover placement="bottom" trigger="hover">
								<ul class="see_discuss">
									<li style="color: #a2a2a2;line-height: 22px;letter-spacing: 1px;">
										<span><b style="color: #5f5f5f;">当前配额：</b>{{ item.quota }}G</span>
									</li>
								</ul>
								<el-button type="text" slot="reference" style="margin-right: 10px;" @click.stop="change_quota(item.docid, item.quota)">修改配额</el-button>
							</el-popover>
							<el-button type="text" @click.stop="change_file(item.docid)">修改名称</el-button>
							<el-button type="text" style="color: #ACACAC;" @click.stop="delete_group(item.docid)">删除</el-button>
						</div>
					</li>
				</ul>
			</el-collapse-item>
		</el-collapse>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				group_file: '',
				activeNames: ['1'],
				quota_val:[]
			};
		},
		mounted() {
			this.get_group_file();
		},
		methods: {
			//遍历群组列表
			get_group_file() {
				let dep = this.$store.state.user.department;
				let params = {}
				if (dep == '辅导员') {
					params = {
						"doctype": 2,
					}
				}else{
					params = {
						"doctype": 6,
					}
				}	
				let that = this;

				this.$axios.post("/api/v1/entrydoc2/get", JSON.stringify(params)).then(res => {
					let array = res.data.docinfos
					array.sort(function(x, y) {
						return y.modified - x.modified;
					});
					array.forEach((item, index) => {
						this.$axios.post("/api/v1/entrydoc2/getdocquota",JSON.stringify({docid: item.docid})).then(res2 => {
							let num = res2.data.quota / 1024 / 1024 / 1024
							array[index].quota = num.toFixed(2)
							if (index == array.length - 1) {
								that.group_file = array
							}
						})
					})
				}).catch(error => {
					console.log(error);
				})
			},

			addGroup() {
				this.$router.push({
					name: 'addGroup'
				})
			},
			handleChange(val) {
				// console.log(val);
			},
			//点击修改名称
			change_file(docid) {
				let that = this;
				this.$prompt('请输入新名称', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
				}).then(({
					value
				}) => {
					let params = {};
					params['docid'] = docid;
					params['name'] = value;
					that.$axios.post("/api/v1/groupdoc/edit", JSON.stringify(params)).then(res => {
						that.$message({
							type: 'success',
							message: '你的新名称为: ' + value
						});
						this.get_group_file();
					}).catch((err) => {
						console.log(err);
					});
				}).catch(() => {
					that.$message({
						type: 'info',
						message: '已取消修改'
					});
				});
			},
			//点击修改配额
			change_quota(docid, quota) {
				let that = this;
				this.$prompt('请输入新配额(单位GB,最大值为500GB)', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					inputPattern: /(^[0-9]{1,3}$)|(^[0-9]{1,3}[\.]{1}[0-9]{1,3}$)/,
					inputValue: quota
				}).then(({
					value
				}) => {
					that.$axios.post("/api/v1/groupdoc/editquota", JSON.stringify({docid, quota: parseInt(value*1024*1024*1024)})).then(res => {
						that.$message({
							type: 'success',
							message: '成功设置新的配额为: ' + value + 'GB'
						});
						that.get_group_file();
					})
				}).catch(() => {
					that.$message({
						type: 'info',
						message: '已取消修改'
					});
				});
			},
			// 点击删除弹出框
			delete_group(docid) {
				let that = this;
				this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					let params = {};
					params['docid'] = docid;
					that.$axios.post("/api/v1/groupdoc/delete", JSON.stringify(params)).then(res => {
						that.$message({
							type: 'success',
							message: '删除成功'
						});
						this.get_group_file();
					}).catch((err) => {
						console.log(err);
					});
				}).catch((err) => {
					that.$message({
						type: 'info',
						message: '已取消删除'
					});
				});
			},
			// 列表页根据id跳转到指定的详情页
			jump(docid, name) {
				this.$router.push({
					path: "/index/groupManagement/groupManagementUsers",
					query: {
						docid,
						name,
						path: '/index/groupManagement/groupManagementUsers?docid=' + docid
					},
				});
			},
			role() {
				let dep = this.$store.state.user.department
				console.log(dep);
				if (dep == '辅导员') {
					return true;
				}
				return false;
			}
		},
	};
</script>

<style scoped lang="scss">
	::v-deep .el-collapse-item__header {
		background: #ECECEC;
		padding-left: 10px;
	}

	::v-deep .el-collapse-item__wrap {
		border: none;
	}

	::v-deep .el-collapse-item__content {
		padding: 0;
	}

	.group_file {
		padding: 0 20px;
		cursor: pointer;

		.group_file_left {
			justify-content: left;

			i {
				font-size: 24px;
			}

			p {
				padding: 0 15px;
				line-height: 50px;
			}

			span {
				color: #ACACAC;
			}
		}

		.group_file_right {
			display: none;
		}
	}

	.group_file:hover {
		background-color: #CBDDFF;
	}

	.group_file:hover .group_file_name {
		color: #409EFF;
	}

	.group_file:hover .group_file_right {
		display: block;
	}

	::v-deep .el-message-box__message p {
		margin-left: -35px;
		color: red;
	}
</style>
