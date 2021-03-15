<template>
	<div>
		<div class="header_box">
			<div class="grid-content bg-purple dis_flex">
				<img src="../../assets/img/admin_logo.png" alt="">
				<span class="header_title">后台管理系统</span>
			</div>
			<div class="grid-content bg-purple-lightnt grid-content1">
				<el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
				<span class="header_name">{{ adminName }}</span>
				<span class="el-icon-switch-button" @click="logout"></span>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				adminName: ""
			}
		},
		created() {
			this.getAdminName()
		},
		methods: {
			logout() {
				let params = { "ostype": 4 },
					that = this;
				this.$axios.post("/api/v1/auth1/logout", JSON.stringify(params)).then(res => {
					// 相应成功删除localstorge所有数据
					 localStorage.clear();
					// 跳转到登录页面
					this.$router.replace('/login')
				}).catch(error => {
					console.log(error);
				})
			},
			getAdminName() {
				this.adminName = this.$store.state.user.adminName
			}
		}
	}
</script>

<style scoped lang="scss">
	.header_box {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 20px;
	}

	.header_title {
		color: #0E63EA;
		font-weight: bold;
		letter-spacing: 1px;
		padding-left: 5px;
	}

	.grid-content1 {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	.header_name {
		padding: 0 20px 0 15px;
	}

	.el-icon-switch-button {
		font-size: 22px;
		color: #000;
		cursor: pointer;
	}
</style>
