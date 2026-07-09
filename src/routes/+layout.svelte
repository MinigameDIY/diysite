<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import { authClient } from "$lib/client/auth-client";
	import "../app.css";

	const session = authClient.useSession();

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="layout">
	<nav class="navbar">
		<div class="navinner">
			<ul>
				<li>
					<a href="/">Home</a>
				</li>

				<li>
					<a href="/explore">Explore</a>
				</li>

				{#if $session.data}
					<li class="right">
						<a href="/user/{$session.data.user.id}/"
							>{$session.data.user.name}</a
						>
					</li>
				{:else}
					<li class="right">
						<a href="/login">Log In</a>
						<a href="/signup">Sign Up</a>
					</li>
				{/if}
			</ul>
		</div>
	</nav>

	<main class="content">
		{@render children()}
	</main>
</div>

<style>
	.layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;

		top: 0;
		left: 0;
	}

	.content {
		margin-top: 15px;
		display: block;
		flex-grow: 1;
		padding-inline: var(--page-pad);
	}

	.navbar {
		display: block;
		height: var(--navbar-height);

		background: #ffda97ff;
		background: linear-gradient(
			180deg,
			rgba(255, 218, 151, 1) 0%,
			rgba(255, 165, 0, 1) 28%,
			rgba(255, 143, 42, 1) 65%,
			rgba(255, 163, 102, 1) 100%
		);

		color: #ffffffff;
	}

	.navinner {
		margin-left: var(--page-pad);
		margin-right: var(--page-pad);
	}

	ul {
		display: flex;
		margin: 0;
		padding: 0;
		list-style: none;
		flex-wrap: nowrap;
		flex-direction: row;
		line-height: 1.5em;
	}

	li {
		position: relative;
		margin: 0;
		height: 100%;
	}

	.right {
		margin-left: auto;
		display: flex;
		flex-direction: row;
	}

	a {
		display: block;
		padding: 13px 15px 4px 15px;
		height: 33px;
		text-decoration: none;
		white-space: no-wrap;
	}
</style>
