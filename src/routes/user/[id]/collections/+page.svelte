<script lang="ts">
	import ElementCard from "$lib/components/ElementCard.svelte";
	import { onMount } from "svelte";

	let { data } = $props();
	let collectionIds = $state([]);
  let collections = $state([]);

	onMount(async () => {
		try {
			const res = await fetch(`/api/user/${data.id}/collections`, {
				method: "GET",
			});

			if (res.ok) {
				const result = await res.json();
				console.log(result);
				collectionIds = result;
			}
		} catch (e) {
			// TODO: add error that shows up
			console.log(e);
		}

    if (collectionIds.length > 0) {
        collectionIds.forEach(async (collectionId) => {
        try {
          const res = await fetch(`/api/collection/${collectionId}`, {
            method: "GET"
          });
  
          if (res.ok) {
            const result = await res.json();
            collections.push(result);
          }
  
        } catch(e) {
          console.log(e);
        }
      })
		}
	});
</script>

<h2>{data.isOwnProfile ? "Your collections" : "Collections"}</h2>

{#if collections.length === 0}
	<p>No collections to show.</p>
{/if}

{#each collections as collection}
	<ElementCard
		element={collection}
		elementType="collection"
		showVisibility={data.isOwnProfile}
	/>
{/each}
