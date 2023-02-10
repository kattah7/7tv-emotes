<script lang="ts">
  import { SOCKET_URL, GLOBAL_SOCKET_URL } from "../Config";

  import { onMount } from "svelte";
  import { UpdateEmote } from "../utils/UpdateEmote";
  import { HandleInput } from "../utils/HandleInput";

  import Footer from "../components/Footer.svelte";
  import EmoteScroller from "../lib/EmoteScroller.svelte";

  onMount(async () => {
    const WS = new WebSocket(SOCKET_URL);
    WS.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      switch (type) {
        case "welcome": {
          WS.send(
            JSON.stringify({
              type: "subscribe",
              channel: "all",
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

  onMount(async () => {
    const GlobalWS = new WebSocket(GLOBAL_SOCKET_URL);
    GlobalWS.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      switch (type) {
        case "global":
          UpdateEmote(data);
          break;
      }
    };
  });
</script>

<div class="Home">
  <div class="outer-title">
    <div class="title">
      <h1 class="stv">7TV</h1>
      <h1>Emote Stats</h1>
    </div>
    <div class="bottom-title">
      <p>Track your emote usage on 7TV</p>
      <p>Tracking since 2022-09-08</p>
    </div>
  </div>

  <div class="search-bar">
    <form on:submit|preventDefault={HandleInput}>
      <input type="text" placeholder="Search..., eg. xQc" />
    </form>
  </div>

  <div class="all-emotes">
    <EmoteScroller type={"GLOBAL"} />
    <EmoteScroller type={"TOP"} />
  </div>
  <Footer />
</div>

<style lang="scss">
  $color-stv: #24dbf6;
  $color-blue: rgb(68, 138, 255);

  .Home {
    background-color: #0d0f0f;
    max-width: 1200px;
    margin: 0 auto;
    justify-content: center;
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
      width: 50%;

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
    flex-direction: row;
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

  .outer-title {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    color: #fff;
    text-align: center;
    animation: slideFromTop 0.5s ease-in-out;
    @keyframes slideFromTop {
      0% {
        transform: translateY(-2%);
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

    p {
      text-align: center;
    }
  }

  .title {
    display: flex;
    flex-direction: row;
    padding: 2rem;
    font-family: cursive;
    margin-bottom: -5rem;

    h1 {
      margin-right: 1rem;
      font-size: 3.5rem;
    }

    h1.stv {
      text-shadow: $color-stv 0px 0px 10px;
      color: $color-stv;
    }

    @media (max-width: 768px) {
      flex-direction: column;
      h1 {
        font-size: 2.5rem;
      }

      h1.stv {
        margin-bottom: -2rem;
      }
    }
  }

  .bottom-title {
    display: flex;
    flex-direction: row;
    padding: 2rem;
    color: gray;
    text-transform: uppercase;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
      sans-serif;

    p {
      margin: 0;
      margin-right: 1rem;
      font-weight: 550;
      margin-bottom: 1.3rem;
    }

    @media (max-width: 768px) {
      flex-direction: column;
      p {
        margin-bottom: 1rem;
        text-align: center;
      }
    }
  }
</style>
