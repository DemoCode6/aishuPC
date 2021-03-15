import Vue from 'vue'
import Vuex from 'vuex'
import user from './moduls/user.js'
import axios from '../axios/index.js'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		msgNum: 0
	},
	mutations: {
		MSGNUM(state, val) {
			state.msgNum = val
		}
	},
	actions: {
		// 消息管理
		getMsgNum({commit}) {
			let that = this,
				num = 0
			axios.post("/api/v1/message/get", {stamp: 0}).then(res => {
				let message = res.data.msgs;
				for (let i in message) {
					if (message[i].isread == false) {
						num++
					}
				}
				commit('MSGNUM', num)
			})
		}
	},
	modules: {
		user
	}
})
