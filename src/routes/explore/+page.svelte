<script lang="ts">
  import ProjectCard from "$lib/components/ProjectCard.svelte";
  let { data } = $props();
</script>

<h1>Explore minigames</h1>

{#each data.projects as project}
  <ProjectCard {project} showOwner={true} />
{/each}