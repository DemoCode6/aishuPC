<template>
	<div>
		<el-button type="primary" size="medium" icon="el-icon-download" v-if="bulk_download" @click="bulkdownloadClick">批量下载</el-button>
		<el-button type="primary" size="medium" icon="el-icon-s-operation" @click="bulk_operation">批量操作</el-button>
	</div>
</template>

<script>
	export default {
		props: {
			checkedArr: Array
		},
		data() {
			return {
				bulk_download: false,
				isCheckedChild: ''
			}
		},
		methods: {
			bulk_operation() {
				this.bulk_download = !this.bulk_download
				this.$emit('childClick', this.bulk_download)
			},
			// 点击批量下载
			bulkdownloadClick(){
				let that = this,
					locvalue = localStorage.getItem('saveBreadcrumb'),
					newName = locvalue + '.zip';
				this.$axios.post("/api/v1/file/batchdownload", {
					name: newName,
					reqhost: process.env.VUE_APP_GENERAL_IP,
					usehttps: false,
					dirs: that.checkedArr,
					files: that.checkedArr
				}).then(res => {
					window.location.href = res.data.url;
				}).catch(error => {
					console.log(error);
				})
			}
		}
	}
</script>


<style scoped lang="scss">
</style>
