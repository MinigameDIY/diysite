<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation";
	import { DIYPlayer } from "diyplayer";
	import { onMount } from "svelte";

	let { data } = $props();
	let session = $derived(data.session);
	let id = $derived(data.id)
	let minigame = $state({});
	let isOwner = $state(false);

	onMount(async () => {
		try {
			const res = await fetch(`/api/minigame/${id}`, {
				method: "GET"
			});

			if (res.ok) {
				const result = await res.json();
				console.log(result);
				minigame = result;
				isOwner = minigame.ownerId === session?.user.id
			}

		} catch(e) {
			// TODO: add error that shows up
			console.log(e);
		}
	})

	let editing = $state(false);
	let editName = $state("");
	let editDescription = $state("");
	let editVisibility = $state("");
	let saving = $state(false);
	let saveError = $state("");

	function startEditing() {
		editName = minigame.name;
		editDescription = minigame.description ?? "";
		editVisibility = minigame.visibility;
		editing = true;
		saveError = "";
	}

	async function handleSave() {
		saving = true;
		saveError = "";

		const res = await fetch(`/api/minigame/${minigame.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: editName,
				description: editDescription,
				visibility: editVisibility,
			}),
		});

		saving = false;

		if (res.ok) {
			editing = false;
			await invalidateAll();
		} else {
			const err = await res.json().catch(() => ({}));
			saveError = err.message ?? "Failed to save changes";
		}
	}

	async function handleDelete() {
		if (!confirm("Delete this minigame? This can't be undone.")) return;

		const res = await fetch(`/api/minigame/${minigame.id}/delete`, {
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
	{#if editing}
		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSave();
			}}
		>
			<label>
				Name
				<input type="text" bind:value={editName} required />
			</label>

			<label>
				Description
				<textarea bind:value={editDescription}></textarea>
			</label>

			<label>
				Visibility
				<select bind:value={editVisibility}>
					<option value="private">Private</option>
					<option value="unlisted">Unlisted</option>
					<option value="public">Public</option>
				</select>
			</label>

			<div class="edit-actions">
				<button type="submit" disabled={saving}>
					{saving ? "Saving..." : "Save"}
				</button>
				<button type="button" onclick={() => (editing = false)}
					>Cancel</button
				>
			</div>

			{#if saveError}
				<p class="error">{saveError}</p>
			{/if}
		</form>
	{:else}
		<h1>{minigame.name}</h1>

		<p class="owner">
			by <a href={`/user/${minigame.ownerId}/profile`}
				>{minigame.ownerName}</a
			>
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

		<a href={`/api/minigame/${minigame.id}/download`} class="download-btn"
			>Download .sb3</a
		>

		{#if isOwner}
			<div class="owner-actions">
				<button onclick={startEditing}>Edit</button>
				<button onclick={handleDelete} class="delete-btn"
					>Delete minigame</button
				>
			</div>
		{/if}
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
	.owner-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}
	.delete-btn {
		color: #b00;
		background: none;
		border: 1px solid #b00;
		border-radius: 4px;
		padding: 0.15rem 0.5rem;
		cursor: pointer;
	}
	.error {
		color: #b00;
		font-size: 0.85rem;
	}
</style>
