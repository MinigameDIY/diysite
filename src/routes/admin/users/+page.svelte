<script lang="ts">
	import { enhance } from '$app/forms';

  let { data } = $props();
</script>

<h1>All users</h1>

<table>
  <thead>
    <tr><th>Name</th><th>ID</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
  </thead>
  <tbody>
    {#each data.users as u}
      <tr>
        <td>{u.name}</td>
        <td><a href={`/user/${u.id}/profile`}>{u.id}</a></td>
        <td>{u.email}</td>
        <td>{u.role}</td>
        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
        <td>
          <form method="POST" action="?/setRole" use:enhance>
            <input type="hidden" name="userId" value={u.id} />
            <select name="role">
              <option value="user" selected={u.role === "user"}>user</option>
              <option value="admin" selected={u.role === "admin"}>admin</option>
            </select>
            <button type="submit">Update</button>
          </form>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
