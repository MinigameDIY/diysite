<script lang="ts">
	import ElementInfo from "$lib/components/ElementInfo.svelte";
	import { DIYPlayer } from "diyplayer";
	import { onMount } from "svelte";

	let { data } = $props();
	let user = $derived(data.user);
	let id = $derived(data.id)
	let minigame = $state({});
	let isOwner = $state(false);

	onMount(async () => {
		try {
			const res = await fetch(`/api/minigame/${id}`, {
				method: "GET"
			});

			if (res.ok) {
				const result = await res.json();
				minigame = result;
				isOwner = minigame.ownerId === user?.id
			}

		} catch(e) {
			// TODO: add error that shows up
			console.log(e);
		}
	})
</script>



<div class="row-container">
	<div class="column-container">
		<DIYPlayer projectUrls={[`/api/minigame/${minigame.id}/download`]} />
	</div>
	<div class="column-container">
		<ElementInfo element={minigame} elementType="minigame" showOwner={true} isOwner={isOwner} showVisibility={isOwner} canEdit={true} />
	</div>
</div>

<style>
	.row-container {
		display: flex;
		flex-direction: row; 
		gap: 20px;
	}

	.column-container {
		display: flex;
		flex-direction: column;
		gap: 10px;
		flex: 1;
		min-width: 0;
	}
</style>
