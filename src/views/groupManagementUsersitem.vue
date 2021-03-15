<template>
	<div>
		<div class="dis_flex top_mb min_w">
			<bread-crumb></bread-crumb>
			<div class="com_style">
				<uploadFiles :docid="docid" class="uploadFiles"></uploadFiles>
				<bulkDownload @childClick="parentClick" :checkedArr="checkedArr"></bulkDownload>
			</div>
		</div>
		<ul class="group_file min_w">
			<li class="dis_flex" v-for="(item,index) in files" :key="this">
				<div class="dis_flex group_file_left">
					<el-checkbox :lable="item.docid" v-if="bulk_download_parent" @change="handelChange(item.docid,$event)"></el-checkbox>
					<i class="el-icon-document group_file_name" @click="previewClick(item.docid)"></i>
					<p class="group_file_name" @click="previewClick(item.docid)">{{item.name}}</p>
					<span>{{item.editor}}最后修改于 ({{item.modified/1000|moment}})</span>
				</div>
				<div class="group_file_right">
					<div class="group_file_right_text" :style="myClass(item.tag)">· {{ item.tag }}</div>
					<div class="download">
						<el-popover placement="bottom" trigger="hover">
							<ul class="see_discuss">
								<li v-for="com in item.comments" style="color: #a2a2a2;line-height: 22px;">
									<span><b style="color: #5f5f5f;">内容：</b>{{ com.comment }}</span>
									<span><b style="padding-left: 15px;color: #5f5f5f;">时间：</b>{{ com.time/1000|moment }}</span>
								</li>
							</ul>
							<el-button type="text" slot="reference" style="margin-right: 20px;" v-if="item.comments && item.comments.length > 0">查看评语</el-button>
						</el-popover>
						<el-button type="text" @click="download(item.docid, item.name)">下载</el-button>
						<template v-if="item.tag == '已通过' || item.tag == '未通过' || item.tag == '已驳回'">
							<el-button type="text" v-if="role()" :class="item.tag == '已通过' ? 'download_text' : 'download_text3'" @click="examineClick(item.docid, '通过', '已通过',index)"
							 disabled>通过</el-button>
							<el-button type="text" v-if="role()" :class="item.tag == '未通过' ? 'download_text2' : 'download_text3'" @click="examineClick(item.docid, '不通过', '未通过',index)"
							 disabled>不通过</el-button>
							<el-button type="text" v-if="role()" :class="item.tag == '已驳回' ? 'download_text2' : 'download_text3'" @click="examineClick(item.docid, '驳回', '已驳回',index)"
							 disabled>驳回</el-button>
							<el-button type="text" v-if="role()" class="download_text1" @click="examineClick(item.docid, '稍后', '审核中',index)">稍后</el-button>
						</template>
						<template v-else>
							<el-button type="text" v-if="role()" class="download_text" @click="examineClick(item.docid, '通过', '已通过',index)">通过</el-button>
							<el-button type="text" v-if="role()" class="download_text2" @click="examineClick(item.docid, '不通过', '未通过',index)">不通过</el-button>
							<el-button type="text" v-if="role()" class="download_text2" @click="examineClick(item.docid, '驳回', '已驳回',index)">驳回</el-button>
							<el-button type="text" v-if="role()" class="download_text1" @click="examineClick(item.docid, '稍后', '审核中',index)">稍后</el-button>
						</template>
					</div>
				</div>
			</li>
		</ul>
	</div>
</template>
<script>
	export default {
		data() {
			return {
				files: '',
				docid: '',
				checkedArr: [],
				bulk_download_parent: false,
				loading: {},
				qu_name: '',
			};
		},
		created() {
			this.getLists();
			this.docid = this.$route.query.docid
			this.qu_name = this.$route.query.name
		},
		methods: {
			// 页面的loading效果
			setLoading() {
				this.loading = this.$loading({
					lock: true,
					text: '疯狂加载中 . . . ',
					spinner: 'el-icon-loading',
					background: 'rgba(0, 0, 0, 0.5)',
					target: document.querySelector('main'),
				});
			},
			// 获取文件接口
			getLists() {
				// loding start
				this.setLoading();
				let params = this.$route.query;
				let that = this;
				this.$axios.post("/api/v1/dir/list", JSON.stringify({
					docid: params.docid
				})).then(res => {
					let data = res.data.files
					// 遍历文件下所有标签
					data.forEach((item, index) => {
						that.$axios.post("/api/v1/file/attribute", JSON.stringify({
							docid: item.docid
						})).then(res => {
							if (res.data.tags.length) {
								data[index].tag = res.data.tags[1]
							} else {
								data[index].tag = '待审核'
							}
							if (index == data.length - 1) {
								// 遍历文件下所有评论
								data.forEach((item, index) => {
									that.$axios.post("/api/v1/file/getcomment", JSON.stringify({
										docid: item.docid
									})).then(res => {
										data[index].comments = res.data.comments
										if (index == data.length - 1) {
											that.files = data
										}
									})
								})
							}
						})
					})
				})
				that.loading.close();
			},
			parentClick(data) {
				if (data == true) {
					this.bulk_download_parent = !this.bulk_download_parent
				} else {
					this.bulk_download_parent = !this.bulk_download_parent
				}
			},
			// 把选中的值传给父组件
			handelChange(docid, event) {
				if (event) {
					this.checkedArr.push(docid)
				} else {
					let index = this.checkedArr.indexOf(docid)
					this.checkedArr.splice(index, 1)
				}
			},
			// 审核接口
			examineClick(docid, tag, tag2, index) {
				let that = this;
				this.$confirm('您确定要'+tag+'该文件吗, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					// 1查找标签
					that.$axios.post("/api/v1/file/attribute", JSON.stringify({
						docid
					})).then(res => {
						if (res.data.tags.length) {
							let tags = res.data.tags
							// 2删除现有
							that.$axios.post("/api/v1/file/deletetag", JSON.stringify({
								docid,
								tag: tags[0]
							})).then(res => {
								that.$axios.post("/api/v1/file/deletetag", JSON.stringify({
									docid,
									tag: tags[1]
								})).then(res => {
									// 直接添加
									that.$axios.post("/api/v1/file/addtag", JSON.stringify({
										docid,
										tag
									})).then(res => {
										that.$axios.post("/api/v1/file/addtag", JSON.stringify({
											docid,
											tag: tag2
										})).then(res => {
											if (tag == '驳回') {
												that.shareReject()
											}
											that.$message({
												type: 'success',
												message: '审核成功'
											})
											that.discuss(docid, index);
										})
									})
								})
							})
						} else {
							// 直接添加
							that.$axios.post("/api/v1/file/addtag", JSON.stringify({
								docid,
								tag
							})).then(res => {
								that.$axios.post("/api/v1/file/addtag", JSON.stringify({
									docid,
									tag: tag2
								})).then(res => {
									if (tag == '驳回') {
										that.shareReject()
									}
									that.$message({
										type: 'success',
										message: '审核成功'
									})
									that.discuss(docid, index);
								})
							})
						}
					})
				})
			},
			// 提交评论接口 start
			discuss(docid, index) {
				let that = this,
					val = '',
					id = 0
				if (this.files[index].comments.length) {
					val = this.files[index].comments[0].comment
					id = this.files[index].comments[0].id
				}

				if (!id) {
					// 没有评论的时候添加
					this.$prompt('请输入您的评语', '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
					}).then(({
						value
					}) => {
						that.$axios.post("/api/v1/file/submitcomment", {
							docid,
							comment: value
						}).then(res => {
							that.$message({
								type: 'success',
								message: value + ' 评价成功'
							});
							// that.$router.go(0)
							that.getLists();
						})
					}).catch(() => {
						that.$message({
							type: 'info',
							message: '已取消添加评语'
						});
						that.getLists();
					});
				} else {
					this.$prompt('请输入您的评语', '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						inputValue: val,
					}).then(({
						value
					}) => {
						that.$axios.post("/api/v1/file/deletecomment", {
							docid,
							commentid: id
						}).then(res => {
							that.$axios.post("/api/v1/file/submitcomment", {
								docid,
								comment: value
							}).then(res => {
								that.$message({
									type: 'success',
									message: value + ' 评价成功'
								});
								// that.$router.go(0)
								that.getLists();
							})
						}).catch(() => {
							that.$message({
								type: 'info',
								message: '已取消添加评语'
							});
							that.getLists();
						});
					})
				}

			},

			// 预览
			previewClick(docid) {
				this.$axios.post("/api/v1/file/previewoss", {
					docid: docid,
					usehttps: false
				}).then(res => {
					let routeUrl = this.$router.resolve({
						path: "/preview",
						query: {
							url: res.data.url
						}
					});
					window.open(routeUrl.href, '_blank');
					// var tempwindow=window.open('_blank');
					// tempwindow.location = res.data.url;
				})
			},
			// 点击下载
			download(docid, name) {
				let that = this,
					quer_name = this.qu_name,
					locvalue = localStorage.getItem('saveBreadcrumb'),
					newName = locvalue + ' -- ' + quer_name + ' -- ' + name;
				this.$prompt('请输入下载文件名称', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					inputValue: newName
				}).then(({
					value
				}) => {
					this.$axios.post("/api/v1/file/osdownload", {
						authtype: "QUERY_STRING",
						docid: docid,
						reqhost: process.env.VUE_APP_GENERAL_IP,
						rev: "",
						savename: value,
						usehttps: false
					}).then(res => {
						window.location.href = res.data.authrequest[1];
					}).catch(error => {
						console.log(error);
					})
				}).catch(() => {
					this.$message({
						type: 'info',
						message: '取消下载'
					});
				});
			},

			myClass(tag) {
				if (tag == '已通过') {
					return 'color: #3FB769'
				}
				if (tag == '未通过') {
					return 'color: #F23D66'
				}
				if (tag == '待审核') {
					return 'color: #aaa'
				}
				if (tag == '审核中') {
					return 'color: #E39F57'
				}
				if (tag == '已驳回') {
					return 'color: #aaa'
				}
			},

			// 分享驳回信息
			shareReject() {
				let params = {},
					that = this,
					tags = [],
					uid = 0,
					endtime
				// 取用户id（学生文件夹标签）
				this.$axios.post("/api/v1/file/attribute", JSON.stringify({
						docid: that.docid
					}))
					.then(res => {
						tags = res.data.tags
						if (tags.length) {
							uid = tags[0]
							endtime = parseInt(tags[1])
							endtime = (endtime + (86400 * 3 * 1000)) * 1000
							// 权限分享
							params['docid'] = this.docid;
							params['perminfos'] = [{
								accessorid: uid,
								accessortype: 'user',
								denyvalue: 0,
								allowvalue: 95,
								endtime
							}]
							params['inherit'] = true;
							that.$axios.post("/api/v1/perm2/set", JSON.stringify(params)) // 分享驳回消息
						} else {
							// 学生文件夹没有绑定学生的id
							that.$message({
								type: "error",
								message: "分享驳回信息失败",
							});
						}
					})
			},
			role() {
				let dep = this.$store.state.user.department
				if (dep == '辅导员') {
					return true;
				}
				return false;
			}
		},
	}
</script>

<style scoped lang="scss">
	.com_style {
		display: flex;

		.uploadFiles {
			margin-right: 10px;
		}
	}

	.group_file {
		background-color: #fff;
		box-sizing: border-box;

		li {
			height: 50px;
			padding: 0 30px;

			&:hover {
				background-color: #CBDDFF;
				cursor: pointer;
			}

			&:hover .group_file_right_text {
				display: none;
			}

			&:hover .group_file_name {
				color: #409EFF;
			}

			.group_file_left {
				font-size: 14px;

				p {
					padding: 0px 15px;
					font-size: 16px;
				}

				i {
					font-size: 24px;
					margin-left: 12px;
				}

				span {
					color: #ACACAC;
				}
			}

			.group_file_right {
				font-size: 14px;

				.download {
					display: none;

					.download_text {
						color: #3FB769;
					}

					.download_text2 {
						color: #636363;
					}

					.download_text3 {
						color: #c7c7c7;
					}

					.download_text1 {
						color: #E39F57;
					}
				}
			}
		}

		li:hover .download {
			display: block;
		}

	}
</style>
