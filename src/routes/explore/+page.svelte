<script lang="ts">
	import ElementCard from "$lib/components/ElementCard.svelte";
	import { onMount } from "svelte";

	let { data } = $props();
	let user = $derived(data.user);
	let id = $derived(data.id);

	let minigames = $state({});
	let collections = $state({});
	onMount(async () => {
		for (const element of ["minigame", "collection"]) {
			try {
				const res = await fetch(
					`/api/feed?feed=date&element=${element}`,
					{
						method: "GET",
					},
				);

				if (res.ok) {
					const result = await res.json();
					if (element === "minigame") {
						minigames = result;
					} else {
						collections = result;
					}
				}
			} catch (e) {
				// TODO: add error that shows up
				console.log(e);
			}
		}
	});
</script>

<h1>Explore minigames</h1>

<div class="containerDiv">
	{#each minigames as minigame}
		<ElementCard
			element={minigame}
			elementType="minigame"
			showOwner={true}
		/>
	{/each}
</div>

<h1>Explore collections</h1>

<div class="containerDiv">
	{#each collections as collection}
		<ElementCard
			element={collection}
			elementType="collection"
			showOwner={true}
		/>
	{/each}
</div>

<style>
	.containerDiv {
		max-height: 500px;
		overflow: scroll;
	}
</style>
