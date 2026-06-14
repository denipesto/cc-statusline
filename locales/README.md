# Localization

Each file here is one language: `<code>.json`, where `<code>` is an ISO 639-1 code
(`en`, `ru`, `de`, `fr`, `ja`, `zh`, …). **English (`en.json`) is the source of truth.**

## Add a language

1. Copy `en.json` → `<code>.json`.
2. Translate the **values**. Keep:
   - the JSON **keys** exactly,
   - slash commands like `/compact` as-is,
   - `name` set to the language's own name (e.g. `"Deutsch"`, `"日本語"`).
3. Test it:
   ```sh
   # set "lang": "<code>" in ../config.json, then:
   npm run demo
   ```
4. Open a PR.

Any key you omit falls back to English, so a partial translation is still valid.

## Schema

```jsonc
{
  "name": "English",            // language's own name
  "tamagotchi": {               // claudegochi mood phrases
    "starving": "FEED ME! /compact",
    "hungry":   "tummy rumbling…",
    "sleepy":   "late… nap time? zZ",
    "content":  "full & happy",
    "ok":       "feeling good"
  },
  "context": {
    "left": "left"              // suffix in "64k left"
  }
}
```

New user-facing strings added to widgets should be added to `en.json` first, then
filled in per language (or left to fall back).
