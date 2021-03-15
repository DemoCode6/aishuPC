<template>
	<div>
		<el-row class="tac">
			<el-col>
				<el-menu :default-active="menuDefaultActive" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose" router>
					<el-menu-item index="1" class="el-menu-item" route="/index/appManagement" v-if="role()">
						<i class="el-icon-s-operation"></i>
						<span slot="title">应用管理<span class="el-icon-arrow-right"></span></span>
					</el-menu-item>
					<el-menu-item index="2" route="/index/groupManagement">
						<i class="el-icon-s-finance"></i>
						<span slot="title">群组管理<span class="el-icon-arrow-right"></span></span>
					</el-menu-item>
					<el-menu-item index="3" route="/index/msgManagement">
						<i class="el-icon-chat-dot-round"></i>
						<span slot="title">消息管理<span class="el-icon-arrow-right"></span><el-badge v-if="msgNum > 0" :value="msgNum" class="item"></el-badge></span>
					</el-menu-item>
				</el-menu>
			</el-col>
		</el-row>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				menuDefaultActive: "1",
			}
		},
		created(){
			// this.share_message();
			if(this.$route.path == "/index/appManagement"){
				this.menuDefaultActive = "1"
			}
			if(this.$route.path == "/index/groupManagement"){
				this.menuDefaultActive = "2"
			}
			if(this.$route.path == "/index/groupManagement/addGroup"){
				this.menuDefaultActive = "2"
			}
			if(this.$route.path == "/index/groupManagement/groupManagementUsers"){
				this.menuDefaultActive = "2"
			}
			if(this.$route.path == "/index/groupManagement/groupManagementUsers/groupManagementUsersitem"){
				this.menuDefaultActive = "2"
			}
			if(this.$route.path == "/index/msgManagement"){
				this.menuDefaultActive = "3"
			}
		},
		computed: {
			msgNum() {
				return this.$store.state.msgNum
			}
		},
		methods: {
			handleOpen(key, keyPath) {
				console.log(key, keyPath);
			},
			handleClose(key, keyPath) {
				console.log(key, keyPath);
			},
			role() {
				let dep = this.$store.state.user.department
				if (dep == '辅导员') {
					return true;
				}
				return false;
			}
		}
	}
</script>

<style scoped>
	.el-menu-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.el-icon-arrow-right {
		margin: 0 0 4px 20px;
	}

	.el-icon-arrow-right:before {
		font-size: 16px;
	}
	::v-deep .item .el-badge__content{
		padding: 0 5px;
		position: absolute;
		top: -22px;
		right: -15px;
		border:none;
		background-color: #ff2342;
	}
</style>
