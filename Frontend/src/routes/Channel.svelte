<script lang="ts">
  import { onMount } from "svelte";
  import { UpdateEmote } from "../utils/UpdateEmote";
  import { HandleInput } from "../utils/HandleInput";
  import { SOCKET_URL, CHANNEL_API_URL } from "../Config";

  const replaceWindow = window.location.pathname.replace("/c/", "");
  const channel = replaceWindow.toLowerCase();

  interface ChannelEmotes {
    success: boolean;
    message?: string;
    emotes?: {
      emote_id: string;
      emote: string;
      count: number;
    }[];
    user?: {
      twitch_id: string;
      twitch_username: string;
    };
  }

  let data: ChannelEmotes = { success: false };
  let emotes = [];
  const API = `${CHANNEL_API_URL}/${channel}`;

  onMount(async () => {
    const channelEmotes = await fetch(API, {
      method: "GET",
    }).then((res) => res.json());

    data = channelEmotes;
    if (!channelEmotes.success) return;
    emotes = channelEmotes.emotes;

    const WS = new WebSocket(SOCKET_URL);
    WS.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);

      switch (type) {
        case "welcome": {
          WS.send(
            JSON.stringify({
              type: "subscribe",
              channel: channelEmotes.user.twitch_id,
            })
          );
          break;
        }
        case "emote": {
          UpdateEmote(data);
          break;
        }
      }
    };
  });
</script>

<div class="all-emotes">
  <div class="search-bar">
    <form on:submit|preventDefault={HandleInput}>
      <input type="text" placeholder="Search..., eg. xQc" />
    </form>
  </div>

  <div class="channel-emote-scroller">
    {#if data.success}
      <div class="channel-header">
        <p>{data.user.twitch_username}'s Emotes</p>
      </div>
      {#each emotes as emote, index}
        <div class="inner-channel-emotes">
          <p>{index + 1}</p>
          <img
            src={`https://cdn.7tv.app/emote/${emote.emote_id}/3x`}
            alt={emote.emote}
          />
          <div class="emote-info">
            <p>{emote.emote.slice(0, 13)}</p>
            <p class={`count${index + 1} ${emote.emote}`}>
              {emote.count.toLocaleString()}
            </p>
          </div>
        </div>
      {/each}
    {:else}
      <h1 class="error">{data.message}</h1>
    {/if}
  </div>
</div>

<svelte:head>
  {#if data.success}
    <title>DontAddThisBot - {data.user.twitch_username}'s Emotes</title>
  {:else}
    <title>DontAddThisBot - Unknown Channel</title>
  {/if}
</svelte:head>

<style lang="scss">
  $color-blue: rgb(68, 138, 255);
  h1.error {
    color: white;
    font-size: 1.5rem;
    font-weight: 600;
    text-align: center;
    margin-top: 2rem;
  }

  .search-bar {
    text-align: -webkit-center;

    input {
      padding: 0.5rem;
      border: 1px solid grey;
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
      background-color: transparent;
      color: white;
      font-weight: 600;
      width: 300px;

      &:focus {
        outline: none;
        border: 1px solid $color-blue;
        transition: 0.3s ease-in-out;
      }
    }

    @media (max-width: 768px) {
      input {
        width: 80%;
      }
    }
  }

  .all-emotes {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 2rem;
    margin-bottom: 10rem;
    animation: slideFromBottom 0.5s ease-in-out;
    @keyframes slideFromBottom {
      0% {
        transform: translateY(2%);
      }
      100% {
        transform: translateY(0%);
      }
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .channel-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;

    p {
      font-size: 1.5rem;
      font-weight: 600;
      color: white;
      font-family: monospace;
      text-transform: uppercase;
    }
  }

  .channel-emote-scroller::-webkit-scrollbar {
    width: 12px;
    background-color: #333;
  }

  .channel-emote-scroller::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: #555;
  }

  .channel-emote-scroller {
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    padding: 2rem;
    background-color: #333;
    overflow-y: auto;
    overflow-x: hidden;
    width: 30%;
    height: 600px;

    @media (max-width: 768px) {
      width: 80%;
      margin-left: 0;

      &.first-child {
        margin-bottom: 2rem;
      }
    }

    .inner-channel-emotes {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding: 1rem;
      background-color: #222;
      border-radius: 5px;
    }

    .emote-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: end;
      margin-right: 1rem;
      line-height: 1px;
      color: white;

      p:first-child {
        color: #fff;
      }

      p.count1 {
        color: #f2c94c;
      }

      p.count2 {
        color: #c4c4c4;
      }

      p.count3 {
        color: #cd7f32;
      }
    }

    p {
      margin-right: 1rem;
      font-weight: 550;
      margin-bottom: 1rem;
    }

    img {
      height: 45px;
      width: 45px;
      margin-right: 1rem;
      border-radius: 50%;
      margin-right: auto;
    }
  }
</style>
