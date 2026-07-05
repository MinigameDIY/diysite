<script lang="ts">
	interface Props {
		element: {
			id: number | string;
			name: string;
			description?: string | null;
			visibility?: string;
			createdAt: string;
			userId?: string;
			ownerName?: string;
		};
		elementType: string;
		showVisibility?: boolean;
		showOwner?: boolean;
	}

	let {
		element,
		showVisibility = false,
		showOwner = true,
		elementType = "",
	}: Props = $props();
</script>

<div class="element-card">
	<h3><a href={`/${elementType}/${element.id}`}>{element.name}</a></h3>

	{#if showOwner && element.ownerName}
		<p class="owner">
			by <a href={`/user/${element.userId}/`}>{element.ownerName}</a>
		</p>
	{/if}

	{#if element.description}
		<p class="description">{element.description}</p>
	{/if}

	<p class="meta">
		{#if showVisibility && element.visibility}
			<span class="badge">{element.visibility}</span>
		{/if}
		<span class="date"
			>{new Date(element.createdAt).toLocaleDateString()}</span
		>
	</p>
</div>

<style>
	.element-card {
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
