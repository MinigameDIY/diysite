<script lang="ts">
  import { authClient } from "$lib/client/auth-client";
	import { goto } from "$app/navigation";

  let email = $state("");
  let password = $state("");
  let name = $state("");
  let error = $state("");

  async function handleSignup() {
    const { error: err } = await authClient.signUp.email({
      email,
      password,
      name,
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
  <p style="color: red">You are already logged in! (ill still let you make an account though lol)</p>
  <button onclick={handleLogout}>Log Out</button> 
  <br>
  <br>
{/if}
<form onsubmit={(e) => { e.preventDefault(); handleSignup(); }}>
  <input type="text" bind:value={name} placeholder="Name" required />
  <input type="email" bind:value={email} placeholder="Email" required />
  <input type="password" bind:value={password} placeholder="Password" required />
  <button type="submit">Sign Up</button>
</form>

{#if error}
  <p style="color: red">{error}</p>
{/if}