<script lang="ts">
  import Portfolio from './pages/Portfolio.svelte';
  // @ts-ignore
  import AdminTestimonials from './pages/AdminTestimonials.svelte';
  
  const path = window.location.pathname;
  const isAdmin = path.endsWith('/ib-studio');
</script>

{#if isAdmin}
  <AdminTestimonials />
{:else}
  <Portfolio />
{/if}
