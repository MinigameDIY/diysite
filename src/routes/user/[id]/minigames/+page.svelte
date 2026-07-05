<script lang="ts">
	import ElementCard from "$lib/components/ElementCard.svelte";
	import { onMount } from "svelte";

	let { data } = $props();
	let minigameIds = $state([]);
	let minigames = $state([]);

	onMount(async () => {
		try {
			const res = await fetch(`/api/user/${data.id}/minigames`, {
				method: "GET",
			});

			if (res.ok) {
				const result = await res.json();
				console.log(result);
				minigameIds = result;
			}
		} catch (e) {
			// TODO: add error that shows up
			console.log(e);
		}

		if (minigameIds.length > 0) {
			minigameIds.forEach(async (minigameId) => {
				try {
					const res = await fetch(`/api/minigame/${minigameId}`, {
						method: "GET",
					});

					if (res.ok) {
						const result = await res.json();
						minigames.push(result);
					}
				} catch (e) {
					console.log(e);
				}
			});
		}
	});
</script>

<h2>{data.isOwnProfile ? "Your minigames" : "Minigames"}</h2>

{#if minigames.length === 0}
	<p>No minigames to show.</p>
{/if}

{#each minigames as minigame}
	<ElementCard
		element={minigame}
		elementType="minigame"
		showVisibility={data.isOwnProfile}
	/>
{/each}
