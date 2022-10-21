<script>
    import fetch from 'node-fetch';
    import { bot } from '../../../../config.json';

    let channelEmotes = [];
    let isSuccess = [];

    let WS = new WebSocket(`ws://5.161.81.52:${bot.websocket}`);
    const replaceWindow = window.location.pathname.replace('/c/', '');

    function sendWS(type, data) {
        WS.send(
            JSON.stringify({
                type: type,
                data: data,
            })
        );
    }

    WS.onopen = () => {
        console.log(`Connected to room ${replaceWindow}`);
        const fetchChannelEmotes = async () => {
            const { data, success } = await fetch(`/api/bot/info?channel=${replaceWindow}`, {
                method: 'GET',
            }).then((r) => r.json());
            channelEmotes = data;
            isSuccess = success;

            if (success) {
                sendWS('listen', { room: replaceWindow.toLowerCase() });
            } else {
                sendWS('error', { room: replaceWindow.toLowerCase() });
            }
        };
        fetchChannelEmotes();
    };

    WS.onmessage = ({ type, data }) => {
        const parsed = JSON.parse(data);
        const { actor, channel, count, emoteName } = parsed.data;
        if (count !== null) {
            channelEmotes.forEach((emote) => {
                if (emote.name === emoteName) {
                    const findThatEmote = document.getElementById(emoteName);
                    const realUsage = emote.usage + count;
                    findThatEmote.innerHTML = realUsage + count;
                    for (let i = 0; i < channelEmotes.length; i++) {
                        if (channelEmotes[i].name === emoteName) {
                            channelEmotes[i].usage = realUsage;
                        }
                    }
                }
            });
        }
    };
</script>

<svelte:head>
    <title>{replaceWindow}'s Emotes</title>
</svelte:head>

<div class="container">
    {#if isSuccess}
        <div class="channel">
            <h1 id="channel-emote-count">{replaceWindow}'s Emotes</h1>
            {#each channelEmotes as emotes}
                <h3 class="emote_name">{emotes.name ?? `Emote not found`}</h3>
                <p class="emote_usage" id={emotes.name}>{emotes.usage.toLocaleString() ?? `Emote not found`}</p>
                <p class="emote_date">
                    Added at<br />{new Date(emotes.Date).toLocaleDateString('en-US') ?? `Emote not found`}
                </p>
                <img class="emote_image" src="https://cdn.7tv.app/emote/{emotes.emote}/1x" alt="stv" />
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

    img.emote_image {
        width: 40px;
        height: 40px;
    }

    div.channel h3.emote_name {
        position: relative;
        right: -20%;
        top: 15%;
        font-size: 15px;
        font-family: 'Quicksand';
    }

    div.channel p.emote_usage {
        position: relative;
        right: -20%;
        top: 13%;
        font-size: 15px;
        font-family: 'Quicksand';
    }

    div.channel p.emote_date {
        position: relative;
        right: -70%;
        top: 6%;
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
