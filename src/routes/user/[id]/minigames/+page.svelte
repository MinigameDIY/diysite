<script lang="ts">
  import MinigameCard from "$lib/components/MinigameCard.svelte";
  let { data } = $props();
</script>

<h2>{data.isOwnProfile ? "Your minigames" : "Minigames"}</h2>

{#if data.minigames.length === 0}
  <p>No minigames to show.</p>
{/if}

{#each data.minigames as minigame}
  <MinigameCard {minigame} showVisibility={data.isOwnProfile} />
{/each}