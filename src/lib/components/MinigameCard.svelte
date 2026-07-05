<script lang="ts">
	interface Props {
		minigame: {
			id: number | string;
			name: string;
			description?: string | null;
			visibility?: string;
			createdAt: string;
			userId?: string;
			ownerName?: string;
		};
		showVisibility?: boolean;
		showOwner?: boolean;
	}

	let {
		minigame,
		showVisibility = false,
		showOwner = true,
	}: Props = $props();
</script>

<div class="minigame-card">
	<h3><a href={`/minigame/${minigame.id}`}>{minigame.name}</a></h3>

	{#if showOwner && minigame.ownerName}
		<p class="owner">
			by <a href={`/user/${minigame.userId}/profile`}>{minigame.ownerName}</a>
		</p>
	{/if}

	{#if minigame.description}
		<p class="description">{minigame.description}</p>
	{/if}

	<p class="meta">
		{#if showVisibility && minigame.visibility}
			<span class="badge">{minigame.visibility}</span>
		{/if}
		<span class="date">{new Date(minigame.createdAt).toLocaleDateString()}</span>
	</p>
</div>

<style>
	.minigame-card {
		border: 1px solid #ccc;
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 0.75rem;
	}

	.owner {
		font-size: 0.85rem;
		color: #666;
	}

	.description {
		margin: 0.5rem 0;
	}

	.meta {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		font-size: 0.8rem;
		color: #888;
	}

	.badge {
		background: #eee;
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
	}
</style>
