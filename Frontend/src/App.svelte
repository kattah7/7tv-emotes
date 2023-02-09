<script lang="ts">
  import { Router, Route } from "svelte-routing";
  import Navbar from "./components/Navbar.svelte";

  import Home from "./routes/Home.svelte";
  import Channel from "./routes/Channel.svelte";
  import NotFound from "./routes/NotFound.svelte";
</script>

<Router>
  <Navbar />
  <main>
    <Route path="/"><Home /></Route>
    <Route path="/c/:id"><Channel /></Route>
    <Route path="*"><NotFound /></Route>
  </main>
</Router>

<style lang="scss">
  main {
    background-color: #1a1b1e;
    flex: 1;
    overflow-y: auto;
  }
</style>
