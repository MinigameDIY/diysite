<script lang="ts">
  import ProjectCard from "$lib/components/ProjectCard.svelte";
  let { data } = $props();
</script>

<h2>{data.isOwnProfile ? "Your minigames" : "Minigames"}</h2>

{#if data.projects.length === 0}
  <p>No minigames to show.</p>
{/if}

{#each data.projects as project}
  <ProjectCard {project} showVisibility={data.isOwnProfile} />
{/each}