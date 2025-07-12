<script lang="ts">
  let count = $state(0)
  const increment = () => {
    count += 1
  }
</script>

<button onclick={increment}>
  count is {count}
</button>

<h1>Vite + Svelte</h1>
<p>Check out SvelteKit, the official Svelte app framework powered by Vite!</p>
<p>Click on the Vite and Svelte logos to learn more</p>
