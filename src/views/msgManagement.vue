<template>
	<div>
		<ul class="group_file">
			<li class="dis_flex" v-for="(item, index) in message" :key="this" @click="all_read(item.id, index)">
				<div class="unread" v-if="!item.isread"></div>
				<div class="dis_flex group_file_left el-icon-folder-opened"></div>
				<div class="group_file_right">
					<p class="group_file_name">{{item.url}}</p>
					<span>{{item.time/1000|moment}}</span>
					<span>{{item.sender}}给{{item.accessorname}}{{changeType(item.type)}}</span>
					<span>{{changeAllowvalue(item.allowvalue)}}</span>
					<span v-if="item.end > 1">有效期至：{{item.end/1000|moment}}</span>
					<span v-else>有效期至：{{changeEnd(item.end)}}</span>
					<div>所在位置：<span @click="jump(item.gns, item.url)" style="color: #409EFF;">{{item.url}}</span></div>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				message: '',
			}
		},
		created() {
			this.share_message()
		},
		methods: {
			jump(id, url) {
				let urlArr = url.split('/')
				if (urlArr.length == 1) {
					this.$router.push({
						path: "/index/groupManagement",
					});
				}else if (urlArr.length == 2) {
					this.$router.push({
						path: "/index/groupManagement/groupManagementUsers",
						query: {
							docid: id.substring(0, 38),
							name: urlArr[0],
							// path: '/index/groupManagement/groupManagementUsers?docid=' + id
						},
					});
				}
			},
			share_message(index) {
				let params = {
						stamp: 0
					},
					that = this;
				this.$axios.post("/api/v1/message/get", params).then(res => {
					that.message = res.data.msgs;
					let array = that.message;
					// array.reverse()
					array.sort(function (x,y) {
					  return y.time - x.time;
					});
				})
			},
			// 消息已读的接口
			all_read(id, index) {
				let params = {
					msgids: [id]
				},
					that = this;
				this.$axios.post("/api/v1/message/read2", params).then(res => {
					that.message[index].isread = true;
					that.share_message()
					that.$store.dispatch('getMsgNum')
				}).catch(error => {
					console.log(error);
				})
			},
			changeType(type) {
				switch (type) {
					case 1:
						return '开启共享';
					case 2:
						return '关闭共享';
					case 3:
						return '设置所有者';
					case 4:
						return '取消所有者';
					case 5:
						return '开启共享申请';
					case 6:
						return '关闭共享申请';
					case 7:
						return '设置所有者申请';
					case 8:
						return '取消所有者申请';
					case 9:
						return '开启外链申请';
					case 10:
						return '开启共享审核结果';
				}
			},
			changeAllowvalue(allowvalue) {
				switch (allowvalue) {
					case 1:
						return '允许权限: 显示';
					case 3:
						return '允许权限: 显示/预览';
					case 71:
						return '允许权限: 显示/预览/下载/复制';
					case 31:
						return '允许权限: 显示/预览/下载/修改/新建';
					case 95:
						// return '显示/预览/下载/复制/修改/新建';
						return '审核状态：驳回';
					case 127:
						return '允许权限: 显示/预览/下载/复制/修改/新建/删除';
					case 7:
						return '允许权限: 显示/预览/下载';
					case 9:
						return '允许权限: 显示/新建';
				}
			},
			changeEnd(end) {
				if (end == -1) {
					return '永久有效'
				} else {
					return end
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	.group_file {
		background-color: #fff;
		min-width: 1115px;

		li {
			padding: 0 20px;
			justify-content: left;
			border-bottom: 1px solid #f9f9f9;
			line-height: 30px;
			position: relative;

			&:hover {
				background-color: #CBDDFF;
				cursor: pointer;
			}

			.unread {
				width: 8px;
				height: 8px;
				border-radius: 50%;
				background-color: red;
				position: absolute;
				top: 10px;
				left: 10px;
			}

			.group_file_left {
				font-size: 24px;
				margin-left: 12px;
				color: #F6CF57;
				margin-right: 16px;
			}

			.group_file_right {
				font-size: 14px;
				color: #868686;

				p {
					font-size: 16px;
					color: #333;
				}

				span {
					margin-right: 20px;
				}
			}
		}

		li:last-child {
			border-bottom: none
		}
	}
</style>
