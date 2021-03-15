<template>
	<div>
		<div class="group_nav">
			<div class="group_nav_b"></div>
			<el-breadcrumb separator-class="el-icon-arrow-right">
				<el-breadcrumb-item v-for="item in arr" :to="{path: item.path}">
					{{ item.title }}
				</el-breadcrumb-item>
			</el-breadcrumb>
		</div>

	</div>

</template>
<script>
	export default {
		data() {
			return {
				arr: []
			}
		},
		created() {
			this.a()
		},
		methods: {
			a() {
				if (this.$route.meta.title == '群组管理') {
					this.arr = [{
						title: '群组管理',
						path: '/index/groupManagement'
					}]
				}
				if (this.$route.meta.title == '用户文件夹') {
					if(this.$route.query.path) {
						localStorage.setItem('saveBreadcrumb', this.$route.query.name);
						localStorage.setItem('saveBreadcrumbPath', this.$route.query.path);
					}
					
					this.arr =  [
						{
							title: '群组管理',
							path: '/index/groupManagement'
						},
						{
							title: localStorage.getItem('saveBreadcrumb'),
							path: localStorage.getItem('saveBreadcrumbPath')
						}
					]
				}
				if (this.$route.meta.title == '用户文件') {
					this.arr = [
						{
							title: '群组管理',
							path: '/index/groupManagement'
						},
						{
							title: localStorage.getItem('saveBreadcrumb'),
							path: localStorage.getItem('saveBreadcrumbPath')
						},
						{
							title: this.$route.query.name,
							path: ''
						}
					]
				}
			}
		}
	}
</script>
<style scoped lang="scss">
	.group_nav {
		display: flex;
		align-items: center;

		::v-deep .el-breadcrumb__inner.is-link {
			font-weight: normal;
			color: #409EFF;
		}

		.group_nav_b {
			margin-right: 10px;
			background-color: #409EFF;
			width: 2px;
			height: 20px;
		}
	}
</style>
