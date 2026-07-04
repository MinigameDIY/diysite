<script lang="ts">
  import MinigameCard from "$lib/components/MinigameCard.svelte";
  let { data } = $props();
</script>

<h1>Explore minigames</h1>

{#each data.minigames as minigame}
  <MinigameCard {minigame} showOwner={true} />
{/each}