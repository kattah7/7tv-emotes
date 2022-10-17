<script>
    import fetch from 'node-fetch';

    let channelEmotes = [];
    let isSuccess = [];
    const replaceWindow = window.location.pathname.replace('/c/', '');
    const fetchChannelEmotes = async () => {
        const { data, success } = await fetch(`/api/bot/info?channel=${replaceWindow}`, {
            method: 'GET',
        }).then((r) => r.json());
        channelEmotes = data;
        isSuccess = success;
    };
    fetchChannelEmotes();
</script>

<svelte:head>
    <title>{replaceWindow}'s Emotes</title>
</svelte:head>

<div class="container">
    {#if isSuccess}
        <div class="channel">
            <h1 id="channel-emote-count">{replaceWindow}'s Emotes</h1>
            {#each channelEmotes as emotes}
                <h3 class="emote_name">{emotes.name}</h3>
                <p class="emote_usage">{emotes.usage.toLocaleString()}</p>
                <img src="https://cdn.7tv.app/emote/{emotes.emote}/1x" alt="stv" />
            {/each}
        </div>
    {:else if !isSuccess}
        <h1>Channel not found, Authorize <a href="/auth/twitch">Here</a> or Ask @Kattah</h1>
    {/if}
</div>

<style>
    p {
        font-size: 1.3em;
        margin: 0;
    }

    h1 {
        margin: 0;
    }

    div.channel h3.emote_name {
        position: relative;
        right: -17%;
        top: 9%;
        font-size: 15px;
        font-family: 'Quicksand';
    }

    div.channel p.emote_usage {
        position: relative;
        right: -17%;
        top: 7%;
        font-size: 15px;
        font-family: 'Quicksand';
    }

    div.channel h1 {
        position: relative;
        font-size: 15px;
        right: -10px;
        padding: 0 45px;
        font-family: 'Quicksand';
    }

    div.channel {
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
        margin: 20px 50px;
    }

    .container {
        max-width: 800px;
        display: flex;
        justify-content: space-between;
    }
</style>
