# Pagination

`GET /v1/messages` uses cursor pagination with two query parameters:

| Query | Notes |
|---|---|
| `limit` | Page size. Default `50`, maximum `200`. Values above 200 are capped. |
| `before` | The `ID` of the last message you already have. Returns messages strictly older than it. Leave it out for the first page. |

Results are newest first, ordered by `ID`. Message ids are UUIDv7, so id order is creation
order. New messages that arrive while you are paging do not shift your pages.

To page to the end, pass the last `ID` of each page as the next `before`. Stop when a page
has fewer items than `limit`, or is empty (`[]`).

```js
async function* allMessages() {
  let before = "";
  for (;;) {
    const url = new URL("/v1/messages", process.env.KV_BASE_URL);
    url.searchParams.set("limit", "200");
    if (before) url.searchParams.set("before", before);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${process.env.KV_API_KEY}` } });
    const page = await res.json();
    yield* page;
    if (page.length < 200) return;
    before = page[page.length - 1].ID;
  }
}
```

There is no total count, no forward (`after`) cursor, and no filter.
