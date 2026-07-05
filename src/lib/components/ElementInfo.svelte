<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation";

	interface Props {
		element: {
			id: number | string;
			name: string;
			description?: string | null;
			visibility?: string;
			createdAt: string;
			userId?: string;
			ownerName?: string;
			ownerId?: string;
		};
		elementType: string;
		showOwner?: boolean;
		isOwner?: boolean;
		canEdit?: boolean;
	}

	let {
		element,
		elementType,
		showOwner = true,
		isOwner = false,
		canEdit = false
	}: Props = $props();

	let editing = $state(false);
	let editName = $state("");
	let editDescription = $state("");
	let editVisibility = $state("");
	let editMinigameIds = $state<string[]>([]);

	let saving = $state(false);
	let saveError = $state("");

	function startEditing() {
		editName = element.name;
		editDescription = element.description ?? "";
		editVisibility = element.visibility ?? "private";

		console.log(element);

		if (elementType === "collection")
			editMinigameIds = [...element.minigames];

		editing = true;
		saveError = "";
	}


	let currentIdInput = $state("");

	function addMinigameId() {
		const cleanId = currentIdInput.trim();
		if (cleanId && !editMinigameIds.includes(cleanId)) {
			editMinigameIds = [...editMinigameIds, cleanId];
		}

		currentIdInput = "";
	}

	function removeMinigameId(indexToRemove: number) {
		editMinigameIds = editMinigameIds.filter((_, index) => index !== indexToRemove);
	}

	async function handleSave() {
		saving = true;
		saveError = "";

		const res = await fetch(`/api/${elementType}/${element.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: editName,
				description: editDescription,
				visibility: editVisibility,
				minigames: editMinigameIds
			}),
		});

		saving = false;

		if (res.ok) {
			editing = false;
			window.location.reload();
		} else {
			const err = await res.json().catch(() => ({}));
			saveError = err.message ?? "Failed to save changes";
		}
	}

	async function handleDelete() {
		if (!confirm("Delete this collection? This can't be undone.")) return;

		const res = await fetch(`/api/${elementType}/${element.id}/delete`, {
			method: "DELETE",
		});

		if (res.ok) {
			goto("/user/" + element.ownerId + "/" + elementType);
		} else {
			const err = await res.json().catch(() => ({}));
			alert(err.message ?? `Failed to delete ${elementType}`);
		}
	}
</script>

<div class="info-card">
	<article>
		{#if editing}
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleSave();
				}}>
				
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
				
				{#if elementType === "collection"}
					<label>
						Add Minigame IDs
						<div>
							<input 
								type="text" 
								placeholder="Paste minigame ID..." 
								bind:value={currentIdInput}
								onkeydown={(e) => e.key === "Enter" && (e.preventDefault(), addMinigameId())}
							/>
							<button type="button" onclick={addMinigameId}>Add</button>
						</div>
					</label>


					{#if editMinigameIds.length > 0}
						<ul>
							{#each editMinigameIds as id, index}
								<li>
									{id}
									<button type="button" onclick={() => removeMinigameId(index)}>&times;</button>
								</li>
							{/each}
						</ul>
					{/if}
				{/if}

				{#if saveError}
					<p class="error">{saveError}</p>
				{/if}
			</form>
		{:else}
			<h1>{element.name}</h1>

			{#if showOwner}
				<p class="owner">
					by <a href={`/user/${element.ownerId}/`}
						>{element.ownerName}</a
					>
					{#if isOwner}
						(you!)
					{/if}
				</p>
			{/if}

			{#if element.description}
				<p class="description">{element.description}</p>
			{/if}

			<p class="meta">
				{#if isOwner && element.visibility}
					<span class="badge">{element.visibility}</span>
				{/if}
				<span class="date">{new Date(element.createdAt).toLocaleDateString()} {new Date(element.createdAt).toLocaleTimeString()}</span>
			</p>

			{#if isOwner && canEdit}
				<div class="owner-actions">
					<button onclick={startEditing}>Edit</button>
					<button onclick={handleDelete} class="delete-btn">Delete {elementType}</button>
				</div>
			{/if}
		{/if}
	</article>
</div>

<style>
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
