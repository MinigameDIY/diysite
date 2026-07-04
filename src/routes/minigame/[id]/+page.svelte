<script lang="ts">
	import { goto } from "$app/navigation";
	import { DIYPlayer } from "diyplayer";
	let { data } = $props();

	let minigame = $derived(data.minigame);
	let isOwner = $derived(data.isOwner);

  async function handleDelete() {
    if (!confirm("Delete this minigame? This can't be undone.")) return;

    const res = await fetch(`/api/minigame/delete/${minigame.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      goto("/user/" + minigame.ownerId + "/minigames");
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.message ?? "Failed to delete minigame");
    }
  }
</script>

<DIYPlayer projectUrls={[`/api/minigame/${minigame.id}/download`]} />
<article>
	<h1>{minigame.name}</h1>

	<p class="owner">
		by <a href={`/user/${minigame.ownerId}/profile`}>{minigame.ownerName}</a>
		{#if isOwner}
			(you!)
		{/if}
	</p>

	{#if isOwner}
		<span class="badge">{minigame.visibility}</span>
	{/if}

	{#if minigame.description}
		<p class="description">{minigame.description}</p>
	{/if}

	<p class="date">
		Uploaded {new Date(minigame.createdAt).toLocaleDateString()}
	</p>

	<a href={`/api/minigame/${minigame.id}/download`} class="download-btn">Download .sb3</a>

  {#if isOwner}
    <button onclick={handleDelete} class="delete-btn">Delete minigame</button>
  {/if}
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
