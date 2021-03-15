const path = require('path')

const resolve = dir => path.join(__dirname, dir)

const BASE_URL = process.env.NODE_ENV === 'production' ? '/' : '/'

module.exports = {
	lintOnSave: false,
	publicPath: BASE_URL,
	chainWebpack: config => {
		config.resolve.alias
			.set('@', resolve('src'))
			.set('_c', resolve('src/components'))
	},
	// 打包时不生成.map文件
	productionSourceMap: false,
	devServer: {
		host: 'localhost',
		port: 8080,
		proxy: {
			'/api': {
				target: process.env.VUE_APP_GENERAL_URL,
				changeOrigin: true,
			},
			'/asbuk': {
				target: process.env.VUE_APP_GENERAL_URL + ':10001',
				changeOrigin: true,
			}
		},
	},
}
