<script lang="ts">
  let { data } = $props();
  
  let project = $derived(data.project);
  let isOwner = $derived(data.isOwner);
</script>

<article>
  <h1>{project.name}</h1>

  <p class="owner">
    by <a href={`/user/${project.ownerId}/profile`}>{project.ownerName}</a> {#if isOwner} (you!) {/if} 
  </p>

  {#if isOwner}
    <span class="badge">{project.visibility}</span>
  {/if}

  {#if project.description}
    <p class="description">{project.description}</p>
  {/if}

  <p class="date">
    Uploaded {new Date(project.createdAt).toLocaleDateString()}
  </p>

  <a href={`api/download/${project.id}`} class="download-btn">Download .sb3</a>
</article>

<style>
  article {
    max-width: 600px;
    margin: 0 auto;
  }
  .owner {
    color: #666;
    font-size: 0.9rem;
  }
  .badge {
    background: #eee;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
  }
  .description {
    margin: 1rem 0;
  }
  .date {
    font-size: 0.85rem;
    color: #888;
  }
  .download-btn {
    display: inline-block;
    margin-top: 1rem;
  }
</style>