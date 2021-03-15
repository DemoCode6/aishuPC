import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import store from './store/index.js'
import axios from './axios/index.js'
import router from './router/index.js'
import echarts from 'echarts'

Vue.prototype.$echarts = echarts

// 面包屑
import breadCrumb from './components/group/breadCrumb'
Vue.component('breadCrumb',breadCrumb);
// 批量下载组件
import bulkDownload from './components/group/bulkDownload'
Vue.component('bulkDownload',bulkDownload);
// 上传文件组件
import uploadFiles from './components/group/uploadFiles'
Vue.component('uploadFiles',uploadFiles);

Vue.use(ElementUI)

//引入时间戳转换时间格式的过滤器
import moment from 'moment/moment'
Vue.filter('moment', function(value, formatString) {
	formatString = formatString || 'YYYY年MM月DD日 HH时mm分ss秒';
	return moment(value).format(formatString);
});

//引入rsa加密
import JSEncrypt from 'jsencrypt';

Vue.prototype.$getRsaCode = function(str) { // 注册方法
	let pubKey =
		`-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7JL0DcaMUHumSdhxXTxqiABBC
DERhRJIsAPB++zx1INgSEKPGbexDt1ojcNAc0fI+G/yTuQcgH1EW8posgUni0mcT
E6CnjkVbv8ILgCuhy+4eu+2lApDwQPD9Tr6J8k21Ruu2sWV5Z1VRuQFqGm/c5vaT
OQE5VFOIXPVTaa25mQIDAQAB
-----END PUBLIC KEY-----`; // ES6 模板字符串 引用 rsa 公钥
	let encryptStr = new JSEncrypt();
	encryptStr.setPublicKey(pubKey); // 设置 加密公钥
	let data = encryptStr.encrypt(str.toString()); // 进行加密
	return data;
}

//base64
import { Base64 } from 'js-base64';

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
