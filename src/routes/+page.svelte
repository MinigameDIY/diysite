<script>
	import { authClient } from "$lib/client/auth-client";
	import { goto } from "$app/navigation";
	import GlanceBox from "$lib/components/GlanceBox.svelte";
	import TitleText from "$lib/components/TitleText.svelte";

	const session = authClient.useSession();

	async function handleLogout() {
		await authClient.signOut();
		goto("/");
	}
</script>

<!--{#if $session.data}-->
<div class="glance-bar">
	<GlanceBox>
		<TitleText text="What's happening?" />
		lalla
	</GlanceBox>
	<GlanceBox>
		<TitleText text="News" />
		gdfg
	</GlanceBox>
</div>

<!-- {/if} -->

<style>
	.glance-bar {
		margin-top: 50px;
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: space-between;
		gap: 50px;
		width: 100%;
		flex-shrink: 0;
		height: 500px;
	}
</style>
