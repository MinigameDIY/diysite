<script lang="ts">
	import { enhance } from "$app/forms";
	let { form } = $props();
</script>

<h1>Upload a minigame</h1>

<form method="POST" enctype="multipart/form-data" use:enhance>
	<label>
		Name
		<input type="text" name="name" required />
	</label>
    <br>
    <br>
	<label>
		Description
		<textarea name="description"></textarea>
	</label>
    <br>
    <br>
	<label>
		Visibility
		<select name="visibility">
			<option value="private">Private (only you)</option>
			<option value="unlisted">Unlisted (anyone with the link)</option>
			<option value="public" selected>Public (listed for everyone)</option>
		</select>
	</label>
    <br>
    <br>
	<label>
		.sb3 file
		<input type="file" name="file" accept=".sb3" required />
	</label>
    <br>
    <br>
	<button type="submit">Upload</button>
</form>

{#if form?.error}
	<p style="color: red">{form.error}</p>
{/if}
