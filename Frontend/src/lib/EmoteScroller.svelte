<script>
  import { onMount } from "svelte";
  import { Fetch } from "../utils/Fetch";
  import { TOP_API_URL, GLOBAL_API_URL } from "../Config";

  export let type;
  let emotes = [];
  let title = "";

  onMount(async () => {
    if (type === "GLOBAL") {
      const { success, emotes: globalEmotes } = await Fetch(GLOBAL_API_URL, {
        method: "GET",
      });

      if (!success) return;
      emotes = globalEmotes;
      title = "Global Emotes";
    } else if (type === "TOP") {
      const { success, emotes: topEmotes } = await Fetch(TOP_API_URL, {
        method: "GET",
      });

      if (!success) return;
      emotes = topEmotes;
      title = "Top Channel Emotes";
    }
  });
</script>

<div class="global-emotes-scroller">
  <div class="global-header">
    <p>{title}</p>
  </div>
  {#each emotes as emote, index}
    <div class="inner-global-emotes">
      <p>{index + 1}</p>
      <img
        src={`https://cdn.7tv.app/emote/${emote.emote_id}/3x.webp`}
        alt={emote.emote}
      />
      <div class="emote-info">
        <p>{emote.emote}</p>
        <p class={`count${index + 1} ${emote.emote}`}>
          {emote.total_count.toLocaleString()}
        </p>
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  $color-stv: #24dbf6;
  $color-blue: rgb(68, 138, 255);

  .global-header {
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

  .global-emotes-scroller::-webkit-scrollbar {
    width: 12px;
    background-color: #333;
  }

  .global-emotes-scroller::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: #555;
  }

  .global-emotes-scroller {
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    padding: 2rem;
    background-color: #333;
    overflow-y: auto;
    width: 30%;
    height: 400px;
    margin-left: 2rem;

    @media (max-width: 768px) {
      width: 80%;
      margin-left: 0;

      &.first-child {
        margin-bottom: 2rem;
      }
    }

    .inner-global-emotes {
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
