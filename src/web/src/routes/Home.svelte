<script lang="ts">
    let globalEmotes = [];
    let channels = [];
    const fetchGlobal = async () => {
        const { data } = await fetch('https://api.kattah.me/global').then((r) => r.json());
        const { global, logging_channels } = data;
        const sortByUsage = global.sort((a, b) => b.usage - a.usage);
        globalEmotes = sortByUsage;
        channels = logging_channels.toLocaleString();
    };
    fetchGlobal();

    let topEmotes = [];
    let topEmotesChannels = [];
    const fetchTopEmotes = async () => {
        const { data, channels } = await fetch('https://api.kattah.me/top').then((r) => r.json());
        const sortByUsage = data.sort((a, b) => b.usage - a.usage);
        topEmotes = sortByUsage;
        topEmotesChannels = channels;
    };
    fetchTopEmotes();

    function startLiveUpdate() {
        setInterval(() => {
            fetchGlobal();
        }, 1500);
    }

    document.addEventListener('DOMContentLoaded', () => {
        startLiveUpdate();
    });
</script>

<svelte:head>
    <title>Home / Emote Tracker</title>
</svelte:head>

<div class="container">
    <div class="global">
        <h1 id="global-channel-count">Global Emotes, Tracking {channels} Channels</h1>
        {#each globalEmotes as emotes}
            <h3 class="emote_name">{emotes.name}</h3>
            <p class="emote_usage">{emotes.usage.toLocaleString()}</p>
            <img src="https://cdn.7tv.app/emote/{emotes.emote}/1x" alt="stv" />
        {/each}
    </div>

    <div class="top">
        <h1>Top Channel Emotes, Tracking {topEmotesChannels} Channels</h1>
        {#each topEmotes as emotes}
            <h3 class="emote_name">{emotes.name}</h3>
            <p class="emote_usage">{emotes.usage.toLocaleString()}</p>
            <img src="https://cdn.7tv.app/emote/{emotes.emote}/1x" alt="stv" />
        {/each}
    </div>
</div>

<style>
    p {
        font-size: 1.3em;
        margin: 0;
    }

    h1 {
        margin: 0;
    }

    div.global h3.emote_name,
    div.top h3.emote_name {
        position: relative;
        right: -17%;
        top: 9%;
        font-size: 15px;
        font-family: 'Quicksand';
    }

    div.global p.emote_usage,
    div.top p.emote_usage {
        position: relative;
        right: -17%;
        top: 7%;
        font-size: 15px;
        font-family: 'Quicksand';
    }

    div.global h1,
    div.top h1 {
        position: relative;
        font-size: 15px;
        right: -10px;
        padding: 0 45px;
        font-family: 'Quicksand';
    }

    div.global {
        transform: translate(5%, 15%);
        scrollbar-gutter: auto;
        height: 600px;
        width: 300px;
        overflow: auto;
        background-color: rgb(51, 50, 50);
        color: white;
        font-family: arial;
        padding: 0 20px;
        max-width: 100%;
        overflow-x: hidden;
        border-radius: 20px;
        border-left: 4px solid gray;
        margin: 0 35px;
    }

    div.top {
        transform: translate(5%, 15%);
        scrollbar-gutter: auto;
        height: 600px;
        width: 300px;
        overflow: auto;
        background-color: rgb(51, 50, 50);
        color: white;
        font-family: arial;
        padding: 0 10px 5px 20px;
        max-width: 100%;
        overflow-x: hidden;
        border-radius: 20px;
        border-left: 4px solid gray;
        margin: 0 -90px;
    }

    .container {
        max-width: 800px;
        display: flex;
        justify-content: space-between;
    }
</style>
