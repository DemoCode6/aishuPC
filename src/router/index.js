import Vue from 'vue'
import Router from 'vue-router'
import Login from '../views/login.vue'
import Index from '../views/index.vue'
import preview from '../views/preview.vue'
import appManagement from '../views/appManagement.vue' // 仪表盘
import groupManagement from '../views/groupManagement.vue'// 群组文档列表页面
import msgManagement from '../views/msgManagement.vue'// 消息管理页面
import groupManagementUsers from '../views/groupManagementUsers.vue' // 学生的文件夹列表页面
import addGroup from '../views/addGroup.vue' // 添加群组页面
import groupManagementUsersitem from '../views/groupManagementUsersitem.vue' // 学生的文件夹详情页面
import store from '../store/index.js'

Vue.use(Router)

const router = new Router({
	mode: 'history',
	routes: [
		{
			path: '/',
			redirect: '/index/appManagement'
		},
		{
			path: '/login',
			component: Login,
			components: {
				Login
			},
			meta: {
				title: '登录'
			}
		},
		{
			path: '/preview',
			name: 'preview',
			component: preview,
			components: {
				preview
			},
			meta: {
				title: '预览'
			}
		},
		{
			path: '/index',
			name: 'index',
			component: Index,
			components: {
				Index
			},
			meta: {
				title: '首页'
			},
			children: [{
					path: 'appManagement',
					name: 'appManagement',
					component: appManagement,
					components: {
						appManagement
					},
				},
				{
					path: 'groupManagement',
					name: 'groupManagement',
					component: groupManagement,
					components: {
						groupManagement
					},
					meta: {
						title: '群组管理'
					},
				},
				{
					path: 'msgManagement',
					name: 'msgManagement',
					component: msgManagement,
					components: {
						msgManagement
					},
				},
				{
					path: 'groupManagement/addGroup',
					name: 'addGroup',
					component: addGroup,
					components: {
						addGroup
					},
				},
				{
					path: 'groupManagement/groupManagementUsers',
					name: 'groupManagementUsers',
					component: groupManagementUsers,
					components: {
						groupManagementUsers
					},
					meta: {
						title: '用户文件夹'
					},
				},
				{
					path: 'groupManagement/groupManagementUsers/groupManagementUsersitem',
					name: 'groupManagementUsersitem',
					component: groupManagementUsersitem,
					components: {
						groupManagementUsersitem
					},
					meta: {
						title: '用户文件'
					},
				},
			]
		},
	]
})

router.beforeEach((to, from, next) => {
	document.title = to.matched[0].meta.title
	let token = localStorage.getItem('Authorization');
	// 验证登录
	if (to.path === '/login') {
		if (token == true) {
			store.dispatch("getMsgNum");
			next('/index')
		}
		next();
	} else {
		if (token === null || token === '') {
			next('/login');
		} else {
			store.dispatch("getMsgNum");
			next();
		}
	}
	next()
})

// 解决导航连点的报错
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
	return originalPush.call(this, location).catch(err => err)
}

export default router
