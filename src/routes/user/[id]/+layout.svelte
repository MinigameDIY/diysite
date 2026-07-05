<script lang="ts">
	let { data, children } = $props();
</script>

<nav>
	<h1>{data.profileUser.name}</h1>
	<a href={`/user/${data.profileUser.id}/`}>Profile</a>
	<a href={`/user/${data.profileUser.id}/minigames`}>Minigames</a>
	<a href={`/user/${data.profileUser.id}/collections`}>Collections</a>
</nav>

{@render children?.()}
