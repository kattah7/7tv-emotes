<script>
    import { Router, Route } from 'svelte-routing';
    import Nav from './Nav.svelte';
    import Home from './routes/Home.svelte';
    import Search from './routes/Search.svelte';

    const navSrc = [
        { path: '/', text: 'Home' },
        { path: '/search', text: 'Search' },
        { path: '/login', text: 'Login' },
    ];
</script>

<Router url={window.location.pathname}>
    <nav>
        <img class="logo" alt="logo" src="/7tvM.png" />
        <ul class="nav">
            <Nav data={navSrc} />
        </ul>
        <a class="m-l" target="_blank" href="https://github.com/kattah7/7tvemotes">
            <img class="link" alt="github" src="/github.png" />
        </a>
    </nav>

    <main>
        <Route path="/"><Home /></Route>
        <Route path="/search"><Search /></Route>
    </main>
</Router>
