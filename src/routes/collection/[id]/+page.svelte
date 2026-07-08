<script lang="ts">
	import ElementInfo from "$lib/components/ElementInfo.svelte";
	import ElementCard from "$lib/components/ElementCard.svelte";
	import { DIYPlayer } from "diyplayer";
	import { onMount } from "svelte";

	let { data } = $props();
	let user = $derived(data.user);
	let id = $derived(data.id);
	let collection = $state({});
	let collection_minigames = $state([]);
	let isOwner = $state(false);

	let diyUrls: string[] = $state([]);

	onMount(async () => {
		try {
			const res = await fetch(`/api/collection/${id}?includeMinigames`, {
				method: "GET",
			});

			if (res.ok) {
				const result = await res.json();
				collection = result;
				isOwner = collection.ownerId === user?.id;
				collection_minigames = collection.minigames;
			}
		} catch (e) {
			// TODO: add error that shows up
			console.log(e);
		}

		for (const minigame of collection_minigames) {
			diyUrls.push(`/api/minigame/${minigame.id}/download`);
		}
	});
</script>

<div class="row-container">
	<div class="column-container">
		<DIYPlayer projectUrls={diyUrls} />
	</div>
	<div class="column-container">
		<ElementInfo
			element={collection}
			elementType="collection"
			showOwner={true}
			{isOwner}
			showVisibility={isOwner}
			canEdit={true}
		/>

		<div class="minigame-container">
			{#each collection_minigames as minigame}
				<ElementCard
					element={minigame}
					elementType="minigame"
					showOwner={true}
					showVisibility={minigame?.isOwner ?? false}
				/>
			{/each}
		</div>
	</div>
</div>

<style>
	.minigame-container {
		max-height: 500px;
		overflow: scroll;
	}

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
