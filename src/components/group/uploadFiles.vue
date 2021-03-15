<template>
	<div>
		<form method="post" enctype="multipart/form-data" id="test">
			<el-upload class="upload-demo" ref="upload" action="fakeaction" :show-file-list="false" :http-request="uploadSectionFile">
				<el-button size="medium" icon="el-icon-plus" type="primary">点击上传</el-button>
			</el-upload>
		</form>
	</div>
</template>
<script>
	import $ from 'jquery'
	export default {
		props: {
			docid: [String, Object]
		},
		data() {
			return {
				uploadDocid: '',
				rev: ''
			};
		},
		methods: {
			uploadSectionFile(par) {
				let file = par.file;
				let params = JSON.stringify({
						docid: this.docid,
						length: file.size,
						name: file.name,
						reqmethod: "POST",
						usehttps: true,
						// reqhost: process.env.VUE_APP_GENERAL_IP,
						ondup: 1
					}),
					that = this;
				// 1.开始上传协议
				$.ajaxSettings.async = false;
				let token = localStorage.getItem('token');
				$.ajax({
					type: 'post',
					url: "/api/v1/file/osbeginupload?tokenid=" + token,
					data: params,
					success: res => {
						that.uploadDocid = res.docid
						that.rev = res.rev
						var ycjg = JSON.stringify({
							csflevel: 0,
							docid: that.uploadDocid,
							rev: that.rev
						});
						// 2.手动触发上传，上传到对象存储
						const form = new FormData();
						form.append("key", that.indexOf(res.authrequest[2]));
						form.append("bucket", that.indexOf(res.authrequest[3]));
						form.append("userid", that.indexOf(res.authrequest[4]));
						form.append("policy", that.indexOf(res.authrequest[5]));
						form.append("signature", that.indexOf(res.authrequest[6]));
						form.append("file", file);
						$.ajax({
							type: "post",
							// url: "/asbuk",
							url: "https://exam.infohill.cn:9029/",
							data: form,
							async: false,
							processData: false,
							contentType: false,
							success: function(res) {
								$.post("/api/v1/file/osendupload?tokenid=" + token, ycjg, function(res) {
									that.$parent.getLists()
								})
							}
						});
					},
					error: (xhr,status,error) => {
						that.$message({
							type: "error",
							message: xhr.responseJSON.errmsg,
						});
					}
				})
				// $.post("/api/v1/file/osbeginupload?tokenid=" + token, params, function(res) {});
				$.ajaxSettings.async = false;
			},
			indexOf(str) {
				let index = str.indexOf(":")
				let string = str.substring(index + 2, str.length);
				return string;
			},
		}
	}
</script>

<style>
</style>
