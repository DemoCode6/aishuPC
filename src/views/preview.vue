<template>
	<div>
		<div class="preview">
			<div class="pdf">
			   <pdf 
			      ref="pdf"
			      :src="pdfUrl">
			    </pdf>
			</div>
		</div>
		
	</div>
</template>

<script>
	import pdf from 'vue-pdf'
	export default {
		data(){
			return {
				pdfUrl:"",
			}
		},
		created() {
			this.pdfUrl = this.$route.query.url
		},
		components:{
		      pdf
		},
	}
</script>

<style scoped lang="scss">
	.preview{
		width: 100vw;
		height: 100vh;
		background-color: #333;
		.pdf{
			margin: auto;
			width: 70%;
			height: 100vh;
			overflow-y: auto;
		}
	}
</style>
