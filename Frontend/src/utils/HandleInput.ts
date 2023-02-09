export function HandleInput(event: Event): void {
  let { value } = event.target[0];
  if (value.length === 0) return;

  value = value.toLowerCase().replace(/ /g, "");
  window.location.href = `/c/${value}`;
}
