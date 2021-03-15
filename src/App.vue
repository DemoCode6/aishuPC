<template>
	<div id="app">
		<router-view name="Login"></router-view>
		<router-view name="Index"></router-view>
		<router-view name="preview"></router-view>
	</div>
</template>
<script>
	export default {
		data() {
			return {
			}
		},
	};
</script>
<style>
	@import url("./assets/css/base.scss");
</style>
