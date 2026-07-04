<script>
	import { authClient } from "$lib/client/auth-client";
	import { goto } from "$app/navigation";

	const session = authClient.useSession();

	async function handleLogout() {
		await authClient.signOut();
		goto("/");
	}
</script>

{#if $session.data}
	<p>Hi {$session.data.user.name}!</p>
	<button onclick={handleLogout}>Log Out</button> 
{:else}
	<a href="/login">Log in</a> or <a href="/signup">Sign up</a>
{/if}
