<script>
    import fetch from 'node-fetch';
    import { bot } from '../../../../config.json';

    let topEmotes = [];
    let topEmotesChannels = [];

    let globalEmotes = [];
    let channels = [];
    let sinceTracking = '';
    let channelCount = 0;

    const fetchTopEmotes = async () => {
        const { data, channels } = await fetch(`/api/bot/top`, {
            method: 'GET',
        }).then((r) => r.json());
        const sortByUsage = data.sort((a, b) => b.usage - a.usage);
        topEmotes = sortByUsage;
        topEmotesChannels = channels;
    };

    const fetchGlobal = async () => {
        const { data } = await fetch(`/api/bot/global`, {
            // CHANGE TO HOSTNAME/GLOBAL AFTER TESTING
            method: 'GET',
        }).then((r) => r.json());
        const { logging_since: since, logging_channels, global } = data;
        const sortByUsage = global.sort((a, b) => b.usage - a.usage);
        globalEmotes = sortByUsage;
        channels = logging_channels;
        sinceTracking = since;
    };

    fetchTopEmotes();
    fetchGlobal();

    document.addEventListener('DOMContentLoaded', () => {
        let WS = new WebSocket(bot.wslink);

        function sendWS(type, data) {
            WS.send(
                JSON.stringify({
                    type: type,
                    data: data,
                })
            );
        }

        WS.onopen = () => {
            sendWS('listen', { room: 'global:top' });
        };

        WS.onmessage = ({ type, data }) => {
            const parsed = JSON.parse(data);
            const { actor, channel, count, emoteName } = parsed.data;
            if (count !== null) {
                topEmotes.forEach((emote) => {
                    if (emote.name === emoteName) {
                        const realUsage = parseInt(emote.usage + count);
                        for (let i = 0; i < topEmotes.length; i++) {
                            if (topEmotes[i].name === emoteName) {
                                topEmotes[i].usage = realUsage;
                            }
                        }
                    }
                });
            }
        };

        let globalWS = new WebSocket(bot.wsglobal);

        function sendGlobalWS(type, data) {
            globalWS.send(
                JSON.stringify({
                    type: type,
                    data: data,
                })
            );
        }

        globalWS.onopen = () => {
            sendGlobalWS('listen', { room: 'global' });
        };

        globalWS.onmessage = ({ data }) => {
            const parsed = JSON.parse(data);
            const {
                type,
                data: { emote: emoteName, channel, count, user },
            } = parsed;
            if (type === 'emote') {
                globalEmotes.forEach((emote) => {
                    if (emote.name === emoteName) {
                        const realUsage = parseInt(emote.usage + count);
                        for (let i = 0; i < globalEmotes.length; i++) {
                            if (globalEmotes[i].name === emoteName) {
                                globalEmotes[i].usage = realUsage;
                            }
                        }
                    }
                });
            }

            if (type === 'join') {
                // update channel count
                channels = (channelCount + 1).toString();
            }
        };
    });
</script>

<svelte:head>
    <title>Home / Emote Tracker</title>
</svelte:head>

<div class="container">
    <div class="global">
        <h1 id="global-channel-count">
            Global Emotes, Tracking {channels.toLocaleString()} Channels <br /> Since {sinceTracking.split('T')[0]}
        </h1>
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

    img {
        width: 40px;
        height: 40px;
    }

    .container {
        max-width: 800px;
        display: flex;
        justify-content: space-between;
    }

    @media (max-width: 768px) {
        div.global {
            transform: translate(50%, 15%);
            scrollbar-gutter: auto;
            height: 300px;
            width: 150px;
            overflow: auto;
            background-color: rgb(51, 50, 50);
            padding: 0 60px 5px 60px;
            overflow-x: hidden;
            border-radius: 20px;
            border-left: 4px solid gray;
        }

        div.top {
            transform: translate(-50%, 125%);
            scrollbar-gutter: auto;
            height: 300px;
            width: 160px;
            overflow: auto;
            background-color: rgb(51, 50, 50);
            padding: 0 60px 5px 60px;
            overflow-x: hidden;
            border-radius: 20px;
            border-left: 4px solid gray;
        }

        div.global h3.emote_name,
        div.top h3.emote_name {
            position: relative;
            top: 18%;
            font-size: 15px;
            font-family: 'Quicksand';
        }

        div.global p.emote_usage,
        div.top p.emote_usage {
            position: relative;
            top: 12%;
            font-size: 15px;
            font-family: 'Quicksand';
        }

        div.global h1,
        div.top h1 {
            position: relative;
            font-size: 15px;
            right: -10px;
            padding: 0 60px 5px 60px;
            font-family: 'Quicksand';
            margin: 10px -110px;
        }

        div.global img,
        div.top img {
            position: relative;
            left: -50px;
            vertical-align: middle;
        }
    }

    @media (min-width: 768px) {
        div.global {
            transform: translate(5%, 15%);
            scrollbar-gutter: auto;
            height: 600px;
            width: 300px;
            overflow: auto;
            background-color: rgb(51, 50, 50);
            padding: 0 20px;
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
            padding: 0 10px 5px 20px;
            overflow-x: hidden;
            border-radius: 20px;
            border-left: 4px solid gray;
            margin: 0 -90px;
        }

        div.global h1,
        div.top h1 {
            position: relative;
            font-size: 15px;
            right: -10px;
            padding: 0 45px;
            font-family: 'Quicksand';
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
    }
</style>
