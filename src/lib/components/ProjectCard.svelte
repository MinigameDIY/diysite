<script lang="ts">
	interface Props {
		project: {
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
		project,
		showVisibility = false,
		showOwner = false,
	}: Props = $props();
</script>

<div class="project-card">
	<h3><a href={`/minigame/${project.id}`}>{project.name}</a></h3>

	{#if showOwner && project.ownerName}
		<p class="owner">
			by <a href={`/user/${project.userId}/profile`}>{project.ownerName}</a>
		</p>
	{/if}

	{#if project.description}
		<p class="description">{project.description}</p>
	{/if}

	<p class="meta">
		{#if showVisibility && project.visibility}
			<span class="badge">{project.visibility}</span>
		{/if}
		<span class="date">{new Date(project.createdAt).toLocaleDateString()}</span>
	</p>

	<a href={`/api/download/${project.id}`} class="download-btn">Download .sb3</a>
</div>

<style>
	.project-card {
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
    
	.download-btn {
		display: inline-block;
		margin-top: 0.5rem;
	}
</style>
