<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	let { data } = $props();

	async function handleDelete(minigameId: string, name: string) {
		if (!confirm(`Delete minigame "${name}"? This can't be undone.`))
			return;

		const res = await fetch(`/api/minigame/${minigameId}/delete`, {
			method: "DELETE",
		});

		if (res.ok) {
			await invalidateAll();
		} else {
			const err = await res.json().catch(() => ({}));
			alert(err.message ?? "Failed to delete minigame");
		}
	}

	async function handleVisibilityChange(
		minigameId: string,
		visibility: string,
	) {
		const res = await fetch(`/api/minigame/${minigameId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ visibility }),
		});

		if (res.ok) {
			await invalidateAll();
		} else {
			const err = await res.json().catch(() => ({}));
			alert(err.message ?? "Failed to update visibility");
		}
	}
</script>

<h1>All minigames</h1>

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>ID</th>
			<th>Owner</th>
			<th>Visibility</th>
			<th>Created</th>
			<th>Actions</th>
		</tr>
	</thead>
	<tbody>
		{#each data.minigames as m}
			<tr>
				<td>{m.name}</td>
				<td><a href={`/minigame/${m.id}`}>{m.id}</a></td>
				<td><a href={`/user/${m.userId}/`}>{m.ownerName}</a></td>
				<td>
					<select
						value={m.visibility}
						onchange={(e) =>
							handleVisibilityChange(m.id, e.currentTarget.value)}
					>
						<option value="public">public</option>
						<option value="private">private</option>
						<option value="unlisted">unlisted</option>
					</select>
				</td>
				<td>{new Date(m.createdAt).toLocaleDateString()}</td>
				<td class="actions">
					<a
						href={`/api/minigame/${m.id}/download`}
						class="download-btn">Download</a
					>
					<button
						onclick={() => handleDelete(m.id, m.name)}
						class="delete-btn">Delete</button
					>
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		text-align: left;
		padding: 0.5rem;
		border-bottom: 1px solid #ddd;
	}
	.actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.download-btn {
		font-size: 0.85rem;
	}
	.delete-btn {
		color: #b00;
		background: none;
		border: 1px solid #b00;
		border-radius: 4px;
		padding: 0.15rem 0.5rem;
		font-size: 0.85rem;
		cursor: pointer;
	}
</style>
