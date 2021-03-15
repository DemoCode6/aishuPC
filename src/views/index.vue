<template>
	<div>
		<el-container>
			<el-header>
				<admin-header></admin-header>
			</el-header>
			<el-container>
				<el-aside width="200px">
					<admin-menu></admin-menu>
				</el-aside>
				<el-main>
					<admin-main>
					</admin-main>
				</el-main>
			</el-container>
		</el-container>
	</div>
</template>

<script>
	import adminHeader from '../components/admin/admin-header'
	import adminMenu from '../components/admin/admin-menu'
	import adminMain from '../components/admin/admin-main'
	export default {
		components: {
			adminHeader,
			adminMenu,
			adminMain
		}
	}
</script>

<style>
	.el-header {
		background-color: #fff;
		color: #333;
		text-align: center;
		line-height: 60px;
	}


	.el-main {
		background-color: #D6E9FF;
		color: #333;
		min-height: 877px;
	}
</style>
