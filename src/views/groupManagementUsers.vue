<template>
	<div>
		<div class="dis_flex top_mb min_w">
			<bread-crumb></bread-crumb>
			<bulkDownload @childClick="parentClick" :checkedArr="checkedArr"></bulkDownload>
		</div>
		<ul class="group_file min_w">
			<li class="dis_flex" v-for="item in dirs" :key="this" @click.stop="jump(item.docid, item.name)">
				<div class="dis_flex group_file_left">
					<el-checkbox :lable="item.docid" v-if="bulk_download_parent" @change="handelChange(item.docid,$event)"
					 @click.native='stopDefault($event)'></el-checkbox>
					<i class="el-icon-folder-opened group_file_name"></i>
					<p class="group_file_name">{{item.name}}</p>
					<span>{{item.editor}}最后修改于 ({{item.modified/1000|moment}})</span>
				</div>
				<div class="group_file_right">
					<div class="group_file_right_text" :style="myClass(item.tag)">· {{item.tag}}</div> 
					<el-button type="text" @click.stop="download(item.docid, item.name)" class="download">下载</el-button>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				dirs: '',
				checkedArr: [],
				bulk_download_parent: false,
				loading: {}
			};
		},
		created() {
			this.getLists();

		},
		methods: {
			// 页面的loading效果
			setLoading() {
				this.loading = this.$loading({
					lock: true,
					text: '疯狂加载中 . . . ',
					spinner: 'el-icon-loading',
					background: 'rgba(0, 0, 0, 0.5)',
					target: document.querySelector('main')
				});
			},
			async getLists() {
				// loding start
				this.setLoading();
				let that = this;
				let dir = await this.f()
				let x = dir;
				let files = []
				let tags = []
				let adminName = this.$store.state.user.adminName 
				let dep = this.$store.state.user.department;
				// 遍历文件夹下所有文件
				for (let dirIndex in dir) {
					let a = 0,// 已通过
						b = 0,// 未通过
						c = 0,// 审核中
						d = 0,// 待审核
						e = 0// 已驳回
					files = await this.f1(dir[dirIndex].docid)
					if (files.length) {
						// 遍历文件下所有标签
						for (let fileIndex in files) {
							tags = await this.f2(files[fileIndex].docid)
							if (tags[1] == '已通过') a++
							if (tags[1] == '未通过') b++
							if (tags[1] == '审核中') c++
							if (tags[1] == '待审核') d++
							if (tags[1] == '已驳回') e++
							if (fileIndex == files.length - 1) {
								// console.log(a,b,c,d);
								// 只有一个文件未操作的时候文件夹默认值
								x[dirIndex].tag = "待审核"
								if (a == files.length) x[dirIndex].tag = "已通过"
								if (d == files.length) x[dirIndex].tag = "待审核"
								if (c > 0) x[dirIndex].tag = "审核中"
								if (b > 0) x[dirIndex].tag = "未通过"
								if (e > 0) x[dirIndex].tag = "已驳回"
							}
						}
					} else {
						x[dirIndex].tag = "待审核"
					}
				}
				that.dirs = x
				
				let x2 = []
				if (dep != '辅导员') {
					for (const i in x) {
						if (x[i].name == adminName) {
							x2.push(x[i])
						}
					}
					this.dirs = x2
				}
				
				that.loading.close();
			},
			// 所有文件夹
			async f(){
				let params = this.$route.query;
				let res = await this.$axios.post("/api/v1/dir/list", JSON.stringify({ docid: params.docid }))
				return res.data.dirs
			},
			// 遍历文件夹下所有文件
			async f1(docid) {
				let res = await this.$axios.post("/api/v1/dir/list", JSON.stringify({docid}))
				return res.data.files
			},
			// 文件属性
			async f2(docid) {
				let res =  await this.$axios.post("/api/v1/file/attribute", JSON.stringify({docid}))
				return res.data.tags
			},
			parentClick(data) {
				if (data == true) {
					this.bulk_download_parent = !this.bulk_download_parent
				} else {
					this.bulk_download_parent = !this.bulk_download_parent
				}
			},
			jump(docid, name) {
				this.$router.push({
					path: "/index/groupManagement/groupManagementUsers/groupManagementUsersitem",
					query: {
						docid,
						name
					},
				});
			},
			stopDefault(e) {
				e.stopPropagation();
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
			// 点击下载
			download(docid, name) {
				let that = this,
				locvalue = localStorage.getItem('saveBreadcrumb'),
					newName = locvalue + ' -- ' + name + '.zip';
				this.$prompt('请输入下载文件夹名称', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					inputValue: newName
				}).then(({
					value
				}) => {
					this.$axios.post("/api/v1/file/batchdownload", {
						reqhost: process.env.VUE_APP_GENERAL_IP,
						name: value,
						dirs: [docid],
						usehttps: false
					}).then(res => {
						window.location.href = res.data.url;
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
			
			myClass(tag){
				if (tag == '已通过') {
					return 'color: #3FB769'
				}
				if (tag == '待审核') {
					return 'color: #aaa'
				}
				if (tag == '已驳回') {
					return 'color: #aaa'
				}
				if (tag == '未通过') {
					return 'color: #F23D66'
				}
				if (tag == '审核中') {
					return 'color: #E39F57'
				}
			}
		},
	}
</script>

<style scoped lang="scss">
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

			&:hover .download {
				display: block;
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
		}

		.group_file_right {
			font-size: 14px;

			.download {
				display: none;
			}
		}
	}
</style>
