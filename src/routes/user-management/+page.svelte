<!--
  User Management Test Page
  Demonstrates the user authentication and management system
-->

<script lang="ts">
  import UserManagement from '$lib/components/UserManagement.svelte';
</script>

<svelte:head>
  <title>User Management - PWA Demo</title>
  <meta name="description" content="User management system with PocketBase integration">
</svelte:head>

<UserManagement />

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
    font-family: system-ui, -apple-system, sans-serif;
  }
</style>
