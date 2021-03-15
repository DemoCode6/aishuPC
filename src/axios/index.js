import Vue from 'vue'
import axios from 'axios'
import router from '../router'
import { Message } from 'element-ui'

// 请求接口的基础配置
Vue.prototype.$axios = axios
axios.interceptors.request.use(
	config => {
		
		// 如果不是登录页面，接口都带header头
		if (window.location.pathname !== '/login') {
			config.headers.Authorization = localStorage.getItem('Authorization');
		} 
		
		return config;
	},
);

// 回复拦截器
axios.interceptors.response.use(res => {
	if (!res.errcode) {
		return res
	} else {
		return Promise.reject(new Error('Error'))
	}
}, error => {
	// 鉴权相关，Token过期或不存在，外链密码错误
	if (error.response.status === 401) {
		if (error.response.data.errcode == 401003) {
			Message({
			    message: error.response.data.errmsg,
				type: 'error',
			})
		}
		localStorage.setItem('Authorization', "");
		router.replace({ path: '/login' });
	}
	if (error.response.status === 403) {
		if (error.response.data.errcode == 403010) {
			Message({
			    message: error.response.data.errmsg,
				type: 'error',
			})
		}
	}
	if (error.response.status === 403) {
		if (error.response.data.errcode == 403001) {
			Message({
			    message: error.response.data.errmsg,
				type: 'error',
			})
		}
	}
})

export default axios;
