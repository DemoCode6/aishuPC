const state = {
	Authorization: localStorage.getItem('Authorization') ? localStorage.getItem('Authorization') : '',
	department: localStorage.getItem('department') ? localStorage.getItem('department') : '',
	adminName: localStorage.getItem('adminName') ? localStorage.getItem('adminName') : '',
}
const mutations = {
	saveToken(state, user) {
		state.Authorization = user.Authorization
		localStorage.setItem('Authorization', user.Authorization);
	},
	saveDepartment(state, param) {
		state.department = param
		localStorage.setItem('department', param);
	},
	saveAdminName(state, param) {
		state.adminName = param
		localStorage.setItem('adminName', param);
	}
}
export default {
	state,
	mutations
}