export function UpdateEmote(data: any): void {
  const { count, emote } = data!;
  if (emote.match(/^[0-9]/) || !emote.match(/^[a-zA-Z0-9_]+$/)) return;
  const emoteCount = document.querySelector(`.inner-global-emotes .${emote}`)!;

  if (emoteCount !== null || emoteCount) {
    const oldCount = parseInt(emoteCount.innerHTML.replace(/,/g, ""));
    const newCount = oldCount + count;
    emoteCount.innerHTML = newCount.toLocaleString();
  }

  const channelEmoteCount = document.querySelector(
    `.inner-channel-emotes .${emote}`
  )!;
  if (channelEmoteCount !== null || channelEmoteCount) {
    const oldCount = parseInt(channelEmoteCount.innerHTML.replace(/,/g, ""));
    const newCount = oldCount + count;
    channelEmoteCount.innerHTML = newCount.toLocaleString();
  }
}
