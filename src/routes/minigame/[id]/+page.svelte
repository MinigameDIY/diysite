<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation";
	import InfoCard from "$lib/components/InfoCard.svelte";
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



<div class="row-container">
	<div class="column-container">
		<DIYPlayer projectUrls={[`/api/minigame/${minigame.id}/download`]} />
	</div>
	<div class="column-container">
		<InfoCard element={minigame} elementType="minigame" showOwner={true} isOwner={isOwner} showVisibility={isOwner} canEdit={true} />
	</div>
</div>

<style>
	.row-container {
		display: flex;
		flex-direction: row; 
		gap: 20px;
	}

	.column-container {
		display: flex;
		flex-direction: column;
		gap: 10px;
		flex: 1;
		min-width: 0;
	}
</style>
