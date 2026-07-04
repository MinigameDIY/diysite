<script lang="ts">
	import { goto } from "$app/navigation";

	let error = $state("");
	let submitting = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;
		error = "";

		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);

		const res = await fetch("/api/minigame/upload", {
			method: "POST",
			body: formData,
		});

		submitting = false;

		if (res.ok) {
			const data = await res.json();
			goto(`/minigame/${data.id}`);
		} else {
			const err = await res.json().catch(() => ({}));
			error = err.message ?? "Upload failed";
		}
	}
</script>

<h1>Upload a minigame</h1>

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
		.sb3 file
		<input type="file" name="file" accept=".sb3" required />
	</label>

	<label>
		Visibility
		<select name="visibility">
			<option value="private" selected>Private (only you)</option>
			<option value="unlisted">Unlisted (anyone with the link)</option>
			<option value="public">Public (listed for everyone)</option>
		</select>
	</label>

	<button type="submit" disabled={submitting}>
		{submitting ? "Uploading..." : "Upload"}
	</button>
</form>

{#if error}
	<p style="color: red">{error}</p>
{/if}
