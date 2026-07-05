<script lang="ts">
	import { goto } from "$app/navigation";

	let error = $state("");
	let submitting = $state(false);
	
	let minigameIds = $state<string[]>([]);
	let currentIdInput = $state("");

	function addMinigameId() {
		const cleanId = currentIdInput.trim();
		if (cleanId && !minigameIds.includes(cleanId)) {
			minigameIds = [...minigameIds, cleanId];
		}

		currentIdInput = "";
	}

	function removeMinigameId(indexToRemove: number) {
		minigameIds = minigameIds.filter((_, index) => index !== indexToRemove);
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;
		error = "";

		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);

		minigameIds.forEach((id) => {
			formData.append("minigameIds", id);
		});

		const res = await fetch("/api/collection/create", {
			method: "POST",
			body: formData,
		});

		submitting = false;

		if (res.ok) {
			const data = await res.json();
			goto(`/collection/${data.id}`);
		} else {
			const err = await res.json().catch(() => ({}));
			error = err.message ?? "Failed to create collection";
		}
	}
</script>

<h1>Create a collection</h1>

<form onsubmit={handleSubmit}>
	<label>
		Name
		<input type="text" name="name" required />
	</label>

	<label>
		Description
		<textarea name="description"></textarea>
	</label>

	<label>
		Visibility
		<select name="visibility">
			<option value="private" selected>Private (only you)</option>
			<option value="unlisted">Unlisted (anyone with the link)</option>
			<option value="public">Public (listed for everyone)</option>
		</select>
	</label>

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

	{#if minigameIds.length > 0}
		<ul>
			{#each minigameIds as id, index}
				<li>
					{id}
					<button type="button" onclick={() => removeMinigameId(index)}>&times;</button>
				</li>
			{/each}
		</ul>
	{/if}

	<button type="submit" disabled={submitting}>
		{submitting ? "Creating..." : "Create Collection"}
	</button>
</form>

{#if error}
	<p style="color: red">{error}</p>
{/if}
