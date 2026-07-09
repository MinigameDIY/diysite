<script lang="ts">
	import Shadow from "./Shadow.svelte";

	let { children } = $props();
</script>

<div class="glance-container">
	<div class="glance-box">
		{@render children()}
	</div>
	<Shadow />
</div>

<style>
	.glance-container {
		width: 100%;
		height: 100%;
	}

	.glance-box {
		background: #ffdcb1;
		background: linear-gradient(
			180deg,
			rgba(255, 220, 177, 1) -55%,
			rgba(255, 251, 250, 1) 28%
		);

		height: 100%;

		border-radius: 5px 5px 0 0;
	}
</style>
