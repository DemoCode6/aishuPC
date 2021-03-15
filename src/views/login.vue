<template>
	<div>
		<div class="login_box">
			<div><img class="radius" src="../assets/img/login.png" alt=""></div>
			<div class="login_right radius">
				<img src="../assets/img/logo.png" alt="">
				<p class="login_right_title">教学群组作业收发管理系统</p>
				<!-- 输入框 -->
				<div class="demo-input-suffix">
					<el-input placeholder="请输入账号" v-model="name">
						<i slot="prefix" class="el-input__icon el-icon-user"></i>
					</el-input>
					<el-input placeholder="请输入密码" v-model="pwd" show-password>
						<i slot="prefix" class="el-input__icon el-icon-lock"></i>
					</el-input>
				</div>
				<el-button type="primary" @click="onSubmit">登录</el-button>
			</div>
		</div>
	</div>
</template>
<script>
	import {
		Base64
	} from 'js-base64'
	export default {
		data() {
			return {
				name: '',
				pwd: '',
			}
		},
		methods: {
			onSubmit() {
				// 准备参数
				let that = this;
				let params = {};
				params['account'] = this.name;
				params['password'] = this.$getRsaCode(this.pwd);
				// 请求接口
				this.$axios.post("/api/v1/auth1/getnew", JSON.stringify(params)).then(res => {
					// 接口响应后
					that.$store.commit('saveToken', {
						Authorization: 'Bearer ' + res.data.tokenid
					})
					localStorage.setItem('token', res.data.tokenid);

					// 获取userid对应的用户信息（有多个部门）
					that.$axios.post("/api/v1/user?method=get&tokenid=" + res.data.tokenid).then(res => {
						// 存vuex
						that.$store.commit('saveDepartment', res.data.directdepinfos[0].name)
						// 存用户名
						that.$store.commit('saveAdminName', res.data.name)
						// 跳转
						let dep = this.$store.state.user.department
						 if (dep == '辅导员') {
							that.$router.replace('/index/appManagement')
						} else{
							that.$router.replace('/index/groupManagement')
						}
						// that.$router.replace('/index/appManagement')
						
					})
				})
			},
		}
	}
</script>

<style scoped lang="scss">
	.login_box {
		background-color: #F2F0F7;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}

	.login_right {
		background-color: #fff;
		width: 330px;
		height: 520px;
		text-align: center;
		margin-left: 50px;
		padding-top: 55px;
		box-sizing: border-box;
		position: relative;

		.login_right_title {
			color: #0079FE;
			font-weight: bold;
			padding: 5px 0 30px;
			letter-spacing: 1px;
		}
	}

	.el-input {
		width: 80%;
		margin-bottom: 20px;
	}

	.el-input__icon {
		color: #409EFF;
		font-size: 18px;
	}

	.el-button--primary {
		width: 80%;
		margin-top: 20px;
		background-image: linear-gradient(to right, #015EEA, #00BFF9);
		border: none;
	}
</style>
