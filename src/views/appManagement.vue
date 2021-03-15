<template>
	<div>
		<div class="Pie_chart dis_flex">
			<div class="Pie_chart_one radius">
				<!-- 第一个饼图 上方 -->
				<div class="dis_flex">
					<div>群组监控提交统计:</div>
					<el-select v-model="defalutVal" filterable @change="changePie1">
						<el-option v-for="item in group_file" :key="item.value" :label="item.name" :value="item.docid"></el-option>
					</el-select>
				</div>
				<!-- 第一个饼图 -->
				<div id="chartPie" class="pie-wrap" style="width:100%;height: 200px"></div>
			</div>
			<div class="Pie_chart_two radius">
				<!-- 第二个饼图 上方 -->
				<div class="dis_flex">
					<div>学生作业完成统计:</div>
					<el-select v-model="value" filterable placeholder="请输入学生姓名">
						<el-option v-for="item in options2" :key="item.userid" :label="item.name" :value="item.name">
						</el-option>
					</el-select>
				</div>
				<!-- 第二个饼图 -->
				<div id="chartPie2" class="pie-wrap" style="width:100%;height: 200px"></div>
			</div>
		</div>
		<!-- 第三个饼图 -->
		<div class="bar_chart radius">
			<div id="Chartbar" :style="{width: '95%', height: '500px'}"></div>
		</div>
	</div>

</template>

<script>
	export default {
		data() {
			return {
				// 第一个饼图
				defalutVal: '',
				group_file: '',
				a1: '',
				a2: '',
				// 第二个饼图
				value: '',
				options2: [],

				// 柱状图
				group_file1: '',
				ranking: [],
				docid: []
			}
		},
		created() {
			this.get_group_file();
			this.get_group_file_draw();
			this.pie2()
		},
		watch: {
			value(val) {
				this.pie2(val)
			}
		},
		methods: {
			//第一个饼图的下拉框遍历群组（第一次进来）
			async get_group_file() {
				let array = await this.dir()
				array.sort(function(x, y) {
					return y.modified - x.modified;
				});
				this.group_file = array
				//下拉默认选择第一个
				this.defalutVal = array[0].name;

				await this.pie1(array[0].docid);
			},

			// 获取所有群组文件夹
			async dir() {
				let res = await this.$axios.post("/api/v1/entrydoc2/get", JSON.stringify({
					"doctype": 2
				}))
				return res.data.docinfos
			},

			// 饼图1选择下拉
			changePie1(v) {
				this.pie1(v)
			},

			// 群组饼图1
			async pie1(docid) {
				let userFile = await this.userFile(docid)
				let a1 = 0, //已提交
					a2 = 0 //未提交
				for (let i in userFile) {
					let file = await this.file(userFile[i].docid)
					if (file.length) {
						a1++
					} else {
						a2++
					}
				}
				this.a1 = a1
				this.a2 = a2
				this.initData();
			},

			// 学生饼图2
			async pie2(username) {
				let g1 = await this.g1()
				let g2 = await this.g2(g1[0].depid)
				let g3 = await this.g3(g2[0].depid) // 所有学生
				this.options2 = g3
				let all = {}
				// 全部
				if (!username) {
					all = await this.studentAll()
				} else {
					all = await this.student(username)
				}
				this.initData2(all.n1, all.n2)
			},

			// 计算所有学生已提交未提交
			async studentAll() {
				let n1 = 0,
					n2 = 0,
					n3 = 0
				let dir = await this.dir()
				for (let i in dir) {
					let userFile = await this.userFile(dir[i].docid)
					for (let i2 in userFile) {
						n3++
						let file = await this.file(userFile[i2].docid)
						if (file.length) {
							let c2 = 0
							for (let i3 in file) {
								let tab = await this.tab(file[i3].docid)
								if (tab[0] != '通过') {
									c2++
								}
								if (parseInt(i3) + 1 == file.length) {
									if (c2 > 0) {
										n2++
									} else {
										n1++
									}
								}
							}
						} else {
							n2++
						}
					}
				}
				return {n1, n2}
			},
			
			async student(username) {
				let n1 = 0, //已完成
					n2 = 0 //未完成
				let dir = await this.dir()
				for (let i in dir) {
					let userFile = await this.userFile(dir[i].docid)
					for (let i2 in userFile) {
						let userFileName = userFile[i2].name
						if (userFileName == username) {
							let file = await this.file(userFile[i2].docid)
							if (file.length) {
								let c2 = 0
								for (let i3 in file) {
									let tab = await this.tab(file[i3].docid)
									if (tab[0] != '通过') {
										c2++
									}
									if (parseInt(i3) + 1 == file.length) {
										if (c2 > 0) {
											n2++
										} else {
											n1++
										}
									}
								}
							} else {
								n2++
							}
						}
					}
				}
				return {n1, n2}
			},

			// 获取所有用户文件夹
			async userFile(docid) {
				let res = await this.$axios.post("/api/v1/dir/list", JSON.stringify({
					docid
				}))
				if (res.data) {
					return res.data.dirs
				}
			},

			// 获取用户文件夹下的所有文件
			async file(docid) {
				let res = await this.$axios.post("/api/v1/dir/list", JSON.stringify({
					docid
				}))
				return res.data.files
			},

			// 获取文件夹标签
			async tab(docid) {
				let res = await this.$axios.post("/api/v1/file/attribute", JSON.stringify({
					docid
				}))
				if (res.data) {
					return res.data.tags
				}
			},

			// 获取根部门
			async g1() {
				let res = await this.$axios.post("/api/v1/department/getroots", {})
				return res.data.depinfos
			},

			// 获取根部门 子部门
			async g2(depid) {
				let res = await this.$axios.post("/api/v1/department/getsubdeps", JSON.stringify({
					depid
				}))
				if (res.data) {
					return res.data.depinfos
				}
			},

			// 获取根部门  子部门下面的学生
			async g3(depid) {
				let res = await this.$axios.post("/api/v1/department/getsubusers", JSON.stringify({
					depid
				}))
				if (res.data) {
					return res.data.userinfos
				}
			},

			// 柱状图遍历数据
			async get_group_file_draw() {
				let params = {
					"doctype": 2
				};
				let res = await this.$axios.post("/api/v1/entrydoc2/get", JSON.stringify(params))
				let array1 = res.data.docinfos;
				array1.sort(function(x, y) {
					return y.modified - x.modified;
				});
				// 设置柱状x轴名称
				for (let i in array1) {
					this.ranking.push(array1[i].name)
				}
				//待审核
				let n1 = []
				//审核中
				let n2 = []
				//已通过
				let n3 = []
				//未通过
				let n4 = []
				// 已驳回
				let n5 = []
				
				/** 计算 */
				let dir = await this.dir()
				dir.sort(function(x, y) {
					return y.modified - x.modified;
				})
				for (let i in dir) {
					let z1=0,z2=0,z3=0,z4=0,z5=0
					let userFile = await this.userFile(dir[i].docid)
					for (let i2 in userFile) {
						let file = await this.file(userFile[i2].docid)
						let c1=0,c2=0,c3=0,c4=0,c5=0
						let flieNull = false
						if (file.length) {
							for (let i3 in file) {
								let tab = await this.tab(file[i3].docid)
								if (tab[0] == '通过') {
									c3++
								} else if (tab[0] == '不通过') {
									c4++
								} else if (tab[0] == '稍后') {
									c2++
								} else if (tab[0] == '驳回') {
									c5++
								} else {
									c1++
								}
							}
						} else {
							c1++
							flieNull = true
						}
						// console.log(userFile[i2].name);
						// console.log(c1);
						// console.log(c2);
						// console.log(c3);
						// console.log(c4);
						// console.log(c5);
						// console.log('--');
						
						if (c3 == file.length && !flieNull) {
							z3++
							// console.log('z3');
							continue
						} else if (c5 > 0) {
							z5++
							// console.log('z5');
							continue
						} else if (c4 > 0) {
							z4++
							// console.log('z4');
							continue
						} else if (c2 > 0) {
							z2++
							// console.log('z2');
							continue
						} else {
							z1++
							// console.log('z1');
						}
					}
					n1.push(z1)
					n2.push(z2)
					n3.push(z3)
					n4.push(z4)
					n5.push(z5)
				}
				// console.log(n1);
				// console.log(n2);
				// console.log(n3);
				// console.log(n4);
				// console.log(n5);
				
				this.drawLine(n1, n2, n3, n4, n5);
			},
			// 同步请求接口
			// 遍历群组下面的学生文件夹
			async f() {
				// let params = this.$route.query;
				let res = await this.$axios.post("/api/v1/dir/list", {
					docid: array1[i].docid
				})
				return res.data.dirs
			},

			// 第二个饼图上方的搜索
			remoteMethod(query) {
				if (query !== '') {
					this.loading = true;
					setTimeout(() => {
						this.loading = false;
						this.options2 = this.list.filter(item => {
							return item.label.toLowerCase()
								.indexOf(query.toLowerCase()) > -1;
						});
					}, 200);
				} else {
					this.options2 = [];
				}
			},

			//第一个饼图
			initData() {
				let a1 = this.a1;
				let a2 = this.a2;
				const myChart = this.$echarts.init(document.getElementById('chartPie'))
				myChart.setOption({
					tooltip: {
						trigger: 'item',
						formatter: "{a} <br/>{b} : {c} ({d}%)"
					},
					legend: {
						orient: 'vertical',
						right: 70, //小标题的位置
						bottom: 'center',
						textStyle: { //图例文字的样式
							color: '#0C67EA',
							// fontSize: 16
						},
						data: ['已提交', '未提交']
					},
					series: [{
						name: '群组提交统计百分比',
						type: 'pie',
						radius: '80%',
						center: ['30%', '50%'],
						label: { //去掉圈外横线
							normal: {
								formatter: '{d}%',
								position: 'inside'
							}
						},
						data: [{
								value: a1,
								name: '已提交',
								itemStyle: {
									color: '#5FCB22'
								},
							},
							{
								value: a2,
								name: '未提交',
								itemStyle: {
									color: '#0160EA'
								},
							}
						],
						itemStyle: {
							emphasis: {
								shadowBlur: 10,
								shadowOffsetX: 0,
								shadowColor: 'rgba(0, 0, 0, 0.5)'
							}
						}
					}]
				});
			},

			//第2个饼图
			initData2(a1 = 0, a2 = 0) {
				const myChart2 = this.$echarts.init(document.getElementById('chartPie2'))
				myChart2.setOption({
					tooltip: {
						trigger: 'item',
						formatter: "{a} <br/>{b} : {c} ({d}%)"
					},
					legend: {
						orient: 'vertical',
						right: 70,
						bottom: 'center',
						textStyle: {
							color: '#0C67EA',
						},
						data: ['完成', '未完成']
					},
					series: [{
						name: '爱数后台数据显示',
						type: 'pie',
						radius: '80%',
						center: ['30%', '50%'],
						label: {
							normal: {
								formatter: '{d}%',
								position: 'inside'
							}
						},
						data: [{
								value: a1,
								name: '完成',
								itemStyle: {
									color: '#5FCB22'
								}
							},
							{
								value: a2,
								name: '未完成',
								itemStyle: {
									color: '#0160EA'
								}
							}
						],
						itemStyle: {
							emphasis: {
								shadowBlur: 10,
								shadowOffsetX: 0,
								shadowColor: 'rgba(0, 0, 0, 0.5)'
							}
						}
					}]
				});
			},

			// 柱状图
			drawLine(n1, n2, n3, n4, n5) {
				let myChart3 = this.$echarts.init(document.getElementById('Chartbar')),
					that = this
				myChart3.setOption({
					legend: {
						data: ['待审核', '审核中', '已通过', '未通过', '已驳回'],
						right: 0,
					},
					tooltip: {},
					xAxis: {
						data: that.ranking
					},
					yAxis: {},
					series: [{
							name: '待审核',
							type: 'bar',
							color: '#EECB5F',
							data: n1,
							stack: '总量',
							barWidth: 50, //柱状图的粗细
							// label: {show: true, 柱状图显示数字},
						},
						{
							name: '审核中',
							type: 'bar',
							color: '#FF7723',
							stack: '总量',
							data: n2,
						}, {
							name: '已通过',
							type: 'bar',
							color: '#5FCB22',
							stack: '总量',
							data: n3,
						}, {
							name: '未通过',
							type: 'bar',
							color: '#0160EA',
							stack: '总量',
							data: n4,
						}, {
							name: '已驳回',
							type: 'bar',
							color: '#aaa',
							stack: '总量',
							data: n5,
						},
					],
					// 数据太多的时候X轴可以拖动
					dataZoom: [{
						type: 'slider',
						xAxisIndex: [0],
						show: true,
						start: 0, //数据窗口范围的起始百分比
						end: 50, //数据窗口范围的起始百分比
						handleSize: 8,
					}, ]
				});
			}
		}
	};
</script>

<style scoped lang="scss">
	.Pie_chart,
	.bar_chart,
	.bar_chart {
		min-width: 1280px;
	}

	.Pie_chart_one,
	.Pie_chart_two {
		width: 49%;
		background-color: #fff;
		padding: 10px;
		box-sizing: border-box;
	}

	.bar_chart {
		background-color: #fff;
		margin-top: 20px;
		padding: 10px;
		box-sizing: border-box;
	}

	::v-deep .el-icon-arrow-up {
		-webkit-transform: rotate(0deg) !important;
		transform: rotate(0deg) !important;
	}

	::v-deep .el-icon-arrow-up:before {
		content: "\e778"
	}
</style>
