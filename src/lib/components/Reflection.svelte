<script lang="ts">
	let { children } = $props();
</script>

<div class="reflection-container">
	<div class="content-real">
		{@render children()}
	</div>
	<div class="fade-container">
		<div class="floor"></div>
		<div class="content-reflect">
			{@render children()}
		</div>
	</div>
</div>

<style>
	.reflection-container {
		position: relative;
		display: inline-block;
	}

	.content-real {
		position: relative;
		z-index: 3;
	}

	.fade-container {
		position: absolute;
		mask-image: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0) 0%,
			white 30%,
			white 80%,
			rgba(255, 255, 255, 0) 100%
		);
		-webkit-mask-image: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0) 0%,
			white 30%,
			white 80%,
			rgba(255, 255, 255, 0) 100%
		);
		top: 100%;
		transform: translateY(-75px);
		width: 100%;
		height: 50px;
	}

	.floor {
		position: absolute;
		left: 0;
		top: 100%;
		transform: translateY(-49px);
		z-index: 1;
		height: 50px;
		width: 100%;
		background: linear-gradient(
			to top,
			rgb(255, 255, 255, 0) 0%,
			rgba(255, 126, 0, 0.14) 100%
		);
	}

	.content-reflect {
		position: absolute;
		left: 0;
		top: 100%;
		width: 100%;
		z-index: 2;
		pointer-events: none;
		transform: scaleY(-1) translateY(120px);

		mask-image: linear-gradient(
			to bottom,
			rgba(255, 255, 255, 0.05) 40%,
			rgba(255, 255, 255, 0.342) 90%
		);
		-webkit-mask-image: linear-gradient(
			to bottom,
			rgba(255, 255, 255, 0.05) 40%,
			rgba(255, 255, 255, 0.342) 90%
		);
	}
</style>
