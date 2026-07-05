<script lang="ts">
	import { authClient } from "$lib/client/auth-client";
	import { goto } from "$app/navigation";

	let email = $state("");
	let password = $state("");
	let name = $state("");
	let error = $state("");

	async function handleLogIn() {
		const { error: err } = await authClient.signIn.email({
			email,
			password,
		});
		if (err) {
			error = err.message ?? "Something went wrong";
		} else {
			window.location.href = "/";
		}
	}

	const session = authClient.useSession();

	async function handleLogout() {
		await authClient.signOut();
		goto("/");
	}
</script>

{#if $session.data}
	<p style="color: red">You are already logged in!</p>
	<button onclick={handleLogout}>Log Out</button>
{:else}
	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleLogIn();
		}}
	>
		<input type="email" bind:value={email} placeholder="Email" required />
		<input
			type="password"
			bind:value={password}
			placeholder="Password"
			required
		/>
		<button type="submit">Log In</button>
	</form>
{/if}

{#if error}
	<p style="color: red">{error}</p>
{/if}
