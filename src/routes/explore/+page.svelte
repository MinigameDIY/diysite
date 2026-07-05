<script lang="ts">
  import MinigameCard from "$lib/components/MinigameCard.svelte";
  let { data } = $props();
</script>

<h1>Explore minigames</h1>

<div class="containerDiv">
  {#each data.minigames as minigame}
    <MinigameCard {minigame} showOwner={true} />
  {/each}
</div>

<h1>Explore collections</h1>

<div class="containerDiv">
  {#each data.collections as collection}
    {collection.name}
  {/each}
</div>

<style>
  .containerDiv {
    max-height: 500px;
    overflow: scroll;
  }
</style>