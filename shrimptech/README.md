# Shrimptech Radio (sketch)

A one-page parody American radio station built around the Shrimptech Radio episode: chrome logo, a spinning 3D shrimp on a rising-sun backdrop, LIVE bugs everywhere, five channel buttons that recolor the same page, a breaking news crawl, a stock ticker and a sponsor row.

It is one static file, `index.html`, plus `audio/`, and lives apart from the LÉON site: nothing in `src/` or the LÉON Netlify build reads this folder. Preview it with any static server:

```sh
npx serve shrimptech   # then open the printed URL
```

## How it works

- **Look**: three colors only (sun red, paper cream, ink) plus chrome on the logo, and Helvetica only, in different weights (Helvetica Neue on Apple devices, Arial where Helvetica isn't installed). Buttons are flat. Each channel arranges the three colors differently in the 16-ray rising-sun backdrop; the channel tile's little sun icon shows which.
- **3D shrimp**: Three.js 0.170 from jsDelivr through an import map. The shrimp is built in code (a segmented body swept along a curve, legs, swimmerets, antennae, rostrum, tail fan) with a clearcoat `MeshPhysicalMaterial` and a `RoomEnvironment` for reflections. Each channel swaps the look: natural, chrome, red wireframe, floppy ears and tongue (K-DOG), black lacquer. The canvas covers the window and the camera offset keeps the shrimp centered on `#stage` wherever it sits on the page. If WebGL or the CDN fails, a spinning emoji takes its place.
- **Player**: play button, now playing, a live spectrum, volume and the five channel tiles. `?ch=wind` or `#wind` opens a channel.
- **Fake live**: the episode loops from Dropbox (`SHOW_SRC`). Every visitor joins at `(now + offset) % SHOW_LEN`, so it plays like a live broadcast with no streaming server and each visitor downloads the file progressively. The host has to answer HTTP Range requests and send CORS headers; the `dl.dropboxusercontent.com` link does both. Sources are tried in order, so the small preview encodes in `audio/` take over when the full file can't play. `SHOW_LEN` is fixed so every source lands on the same second.
- **Closed captions**: a TV-style CC box on the stage shows what is being said right now (`SHOW_CC`, transcribed with Whisper) and the song title during music. The ON AIR card shows who is in the studio at this point of the loop (`SHOW_GUESTS`).

## Channels

| Freq | Channel | What plays |
| --- | --- | --- |
| 106.9420 | SHRIMPTECH RADIO 1 | The episode, in sync with the wall clock |
| 106.9421 | SHRIMPTECH RADIO 2 | The same episode, half a loop later |
| 88.1 | VIAGRA BOYS IN MIDI | Viagra Boys songs as MIDI, played by a small General MIDI synth in Web Audio |
| 99.5 | K-DOG | The Dog Conversation Channel: two dogs, real barks, translated subtitles |
| 87.7 | WIND | Just wind. 24/7. |

- **VIAGRA BOYS IN MIDI** reads Standard MIDI Files listed in `MIDI_FILES` (title and url, for example `midi/pyramid-of-health.mid`). Drums go to a synthesized kit, bass and leads to simple oscillators, all on the shared wall clock. Until files are listed it plays public-domain placeholder tunes.
- **K-DOG** plays single barks cut from `audio/k-dog-barks.mp3`, a sprite built by a small script (onset detection, about 90 barks in big, small and crying groups). Each dog has its own pitch and pan, and a random sequencer keeps the conversation from repeating. To swap the recordings, rebuild the sprite and paste the new `segs` table into `DOG_SPRITE`.
- **WIND** is brown noise through moving band-pass filters with gusts. No file.

## Songs in the episode

Shown in the captions while they play. Blocks marked unidentified show "MUSIC".

| Time | Song |
| --- | --- |
| 0:00 | Man Made of Meat |
| 4:07 | UNO II |
| 10:06 | Pyramid of Health |
| 14:06 | "Sk8erbois" (as announced on air; unidentified) |
| 19:25 | unidentified |
| 25:37 | unidentified |
| 29:48 | The Bog Body |
| 33:35 | Store Policy |
| 38:14 | Best in Show Pt. IV |
| 46:01 | Dirty Boyz |
| 49:47 | Waterboy |
| 55:01 | unidentified |

Edit the titles in `SHOW_CC` (the `♪` rows) when the missing ones are known.

## Easter eggs

Headlines, sponsors (Chicken Water, Raisin Recycling System, Rubber Bucket, Useless Bread, Sauce Slammers, Shrimptech Frozen Shrimp, Shrimpscapes, Milk Tokens) and tickers all come from the episode. Every sponsor links to the Viagra Boys webshop. On top of that:

- Type a word from the show anywhere on the page: `sauce`, `chicken`, `yeehaw`, `dirty`, `felon`, `cringe`, `raisin`, `jamie`. Each plays the matching clip from the episode (`SHOW_CLIPS`), spins the shrimp and counts found eggs on the sticker. `jamie` also pulls something up "on the screen".
- Click the shrimp nine times: caller #9 wins a can of Chicken Water.
- CALL THE STUDIO dials 1-800-SHRIMP-1 in DTMF. Sometimes Ron Dangle picks up, otherwise it's busy.
- At 4:20 ET the clock adds 106.9420.

## Updating the transcript

Captions and clips are generated from a Whisper transcript with word timestamps. To redo them (for example after a new edit of the episode): transcribe with `faster-whisper` (`medium.en`, `word_timestamps=True`), mark the song ranges, and regenerate the `SHOW_CC`, `SHOW_CLIPS` and `PHONE_CLIPS` lines. Update `SHOW_LEN` and `SHOW_GUESTS` if the length or running order changes.

## Production notes

- Hosting: static files on Netlify, published straight from this folder. Dropbox shared links have traffic limits, so for real traffic move the episode to Netlify or a CDN bucket (Cloudflare R2, Bunny), ideally re-encoded to 128 kbps (about 56 MB instead of 140 MB).
- A real 24/7 stream with live DJs and a now-playing API would need Icecast or AzuraCast on a small VPS. The fake-live loop needs no server.
- 3D: a sculpted shrimp (Blender, or bought) exported as Draco-compressed GLB would replace the procedural one. Load it with `GLTFLoader`.
- iOS: the page sets `navigator.audioSession.type = 'playback'` so audio plays with the silent switch on (Safari 16.4+).
