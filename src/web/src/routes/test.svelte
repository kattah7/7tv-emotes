<script>
    import { bot } from '../../../../config.json';
    let WS = new WebSocket(`ws://localhost:${bot.websocket}`);

    WS.onopen = () => {
        console.log('Connected NaM');
    };

    let number = 0;
    WS.onmessage = ({ type, data }) => {
        const parsed = JSON.parse(data);
        console.log(parsed.data);
        if (parsed.data.emote) {
            number = number + 1;
        }
    };
</script>

<svelte:head>
    <title>Search / Emote Tracker</title>
</svelte:head>

<div>
    <p>Test: {number}</p>
</div>

<style>
</style>
