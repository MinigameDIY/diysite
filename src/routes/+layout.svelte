<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { authClient } from "$lib/client/auth-client";

	const session = authClient.useSession();

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="navbar">
	<a href="/">Home</a>
	<a href="/explore">Explore</a>

	{#if $session.data}
		<a href="/user/{$session.data.user.id}/">My account</a>
	{:else}
		<a href="/login">Log In</a>
		<a href="/signup">Sign Up</a>
	{/if}
</nav>

{@render children()}
