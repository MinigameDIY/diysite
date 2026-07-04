<script lang="ts">
  let { data, children } = $props();
</script>

<nav>
  <h1>{data.profileUser.name}</h1>
  <a href={`/user/${data.profileUser.id}/profile`}>Profile</a>
  <a href={`/user/${data.profileUser.id}/minigames`}>Minigames</a>
</nav>

{@render children?.()}