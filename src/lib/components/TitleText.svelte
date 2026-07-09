<script lang="ts">
	import Reflection from "./Reflection.svelte";
	import WalkingIcon from "$lib/assets/icons/walking.svg";

	let { text } = $props();
</script>

<div class="title-text-contanier">
	<div class="text-container">
		<Reflection>
			<div class="text-container-the-second">
				<div class="icon text-gradient"></div>
				<p class="normal-text text-gradient">{text}</p>
			</div>
		</Reflection>
	</div>
</div>

<style>
	.title-text-contanier {
		height: 120px;
		display: flex;
		align-items: center;
		text-wrap-mode: nowrap;
	}

	.text-container {
		transform: translateX(130px);
	}

	.text-container-the-second {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}

	.icon {
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.normal-text {
		font-size: 60px;
	}

	.text-gradient {
		background: #ff8100ff;
		background:
			linear-gradient(
				to right,
				transparent 0%,
				rgba(254, 152, 0, 0.3) 12%,
				transparent 20%,
				rgba(254, 152, 0, 0.2) 25%,
				transparent 30%,
				rgba(254, 152, 0, 0.1) 50%,
				transparent 60%
			),
			linear-gradient(
				90deg,
				rgba(255, 129, 0, 1) 0%,
				rgba(157, 49, 0, 1) 200%
			);

		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
</style>
