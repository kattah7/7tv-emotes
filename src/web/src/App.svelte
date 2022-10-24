<script>
    import { Router, Route } from 'svelte-routing';
    import Nav from './Nav.svelte';
    import Home from './routes/Home.svelte';
    import Search from './routes/Search.svelte';
    import Channel from './routes/Channel.svelte';

    async function join() {
        const r = await fetch('/api/bot/join', {
            method: 'POST',
        }).then((r) => r.json());
        return r;
    }

    let userInfo = [];
    let successAuth = [];
    const fetchSession = async () => {
        const res = await fetch('/api/twitch', {
            method: 'GET',
        });
        const data = await res.json();
        userInfo = data;
        if (data.success) {
            const { display_name, login, id } = data.id.user.data[0];
            const successNav = [{ path: `/c/${login}`, text: `${display_name}'s Emotes` }];
            successAuth = successNav;
        }
        join();
    };
    fetchSession();
</script>

<Router url={window.location.pathname}>
    <nav>
        <img class="logo" alt="logo" src="/7tvM.png" />
        <ul class="nav">
            {#if userInfo.success}
                <li>
                    <a class="Home" href="/">Home</a>
                </li>
                <Nav data={successAuth} />
                <li>
                    <a class="link" href="/search">Search</a>
                </li>
                <li>
                    <a href="/auth/twitch/logout">Logout</a>
                </li>
            {:else}
                <li>
                    <a class="Home" href="/">Home</a>
                </li>
                <li>
                    <a class="link" href="/search">Search</a>
                </li>
                <li>
                    <a href="/auth/twitch">Login</a>
                </li>
            {/if}
        </ul>
        <a class="m-l" target="_blank" href="https://github.com/kattah7/7tvemotes">
            <img class="link" alt="github" src="/github.png" />
        </a>
    </nav>

    <main>
        <Route path="/"><Home /></Route>
        <Route path="/search"><Search /></Route>
        <Route path="/c/:channel"><Channel /></Route>
    </main>
</Router>
