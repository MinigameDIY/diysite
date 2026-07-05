<script lang="ts">
	let { data } = $props();
</script>

<h2>About</h2>
<p>ID: {data.profileUser.id}</p>
<p>Joined: {new Date(data.profileUser.createdAt).toLocaleDateString()}</p>
