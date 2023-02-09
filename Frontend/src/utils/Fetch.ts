export async function Fetch(url: string, options: any = {}): Promise<any> {
  const res = await fetch(url, options);
  const json = await res.json();
  return json;
}
