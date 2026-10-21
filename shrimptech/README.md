# Shrimptech Radio (sketch)

A one-page parody American radio station built around the Shrimp Tech Radio episode: chrome logo, a spinning 3D shrimp on a rising-sun backdrop, LIVE bugs everywhere, six channel buttons that recolor the same page, a breaking news crawl, a stock ticker and a sponsor row.

It is one static file, `index.html`, and lives apart from the LÉON site: nothing in `src/` or the Netlify build reads this folder. Preview it with any static server:

```sh
npx serve shrimptech   # then open the printed URL
```

## How it works

- **Look**: three colors only (sun red, paper cream, ink) plus chrome on the logo. Buttons are flat. Each channel arranges the three colors differently in the 16-ray rising-sun backdrop; the button's little sun icon shows which.
- **3D shrimp**: Three.js 0.170 from jsDelivr through an import map. The shrimp is built in code (a segmented body swept along a curve, legs, swimmerets, antennae, rostrum, tail fan) with a clearcoat `MeshPhysicalMaterial` and a `RoomEnvironment` for reflections. Each channel swaps the look: natural, red low-poly (MIDI MANIA), floppy ears and tongue (K-DOG), black lacquer, cream porcelain, chrome. The canvas covers the window and the camera offset keeps the shrimp centered on `#stage` wherever it sits on the page. If WebGL or the CDN fails, a spinning emoji takes its place.
- **The episode on 106.9420**: SHRIMP TECH RADIO loops the episode from Dropbox (`SHOW_SRC`). Every visitor joins at `now % duration`, so it plays like a live broadcast with no streaming server and each visitor downloads the file progressively. The host has to answer HTTP Range requests and send CORS headers; the `dl.dropboxusercontent.com` link does both. Sources are tried in order, so a small preview encode in `audio/` (used for the claude.ai preview) or the synth bed takes over when the full file can't play.
- **Closed captions**: the LCD shows what is being said in the episode right now (`SHOW_CC`, transcribed with Whisper, songs shown as ♪). The ON AIR card shows who is in the studio at this point of the loop (`SHOW_GUESTS`).
- **Other channels**: synthesized in Web Audio and scheduled against the wall clock too: an 808 R&B bed (THE PRAWN), doo-wop with vinyl crackle (SHRIMP GOLD), an AM-band talk bed (SHRIMP TALK), square-wave versions of public-domain tunes (MIDI MANIA) and two talking dogs panned left and right with translated subtitles (K-DOG). A text-to-speech DJ talks over the synth channels with lines that reference the episode.
- **Deep links**: `?ch=midi-mania` or `#midi-mania` opens a channel.

## Easter eggs

Headlines, sponsors (Chicken Water, Raisin Recycling System, Rubber Bucket, Useless Bread, Sauce Slammers, Shrimpscapes, Milk Tokens) and tickers all come from the episode. On top of that:

- Type a word from the show anywhere on the page: `sauce`, `chicken`, `yeehaw`, `dirty`, `felon`, `cringe`, `raisin`, `jamie`. Each plays the matching clip from the episode (`SHOW_CLIPS`), spins the shrimp and counts found eggs on the sticker. `jamie` also pulls something up "on the screen".
- Click the shrimp nine times: caller #9 wins a can of Chicken Water.
- CALL THE STUDIO dials 1-800-SHRIMP-1 in DTMF. Sometimes Ron Dangle picks up, otherwise it's busy.
- At 4:20 ET the clock adds 106.9420.

## Updating the transcript

Captions and clips are generated from a Whisper transcript with word timestamps. To redo them (for example after a new edit of the episode): transcribe with `faster-whisper` (`medium.en`, `word_timestamps=True`), mark the song ranges, and regenerate the `SHOW_CC`, `SHOW_CLIPS` and `PHONE_CLIPS` lines. Update `SHOW_LEN` and `SHOW_GUESTS` if the length or running order changes.

## Production notes

- Hosting: static files on Netlify (same setup as LÉON). Dropbox shared links have traffic limits, so for real traffic move the episode to Netlify or a CDN bucket (Cloudflare R2, Bunny), ideally re-encoded to 128 kbps (about 56 MB instead of 140 MB).
- A real 24/7 stream with live DJs and a now-playing API would need Icecast or AzuraCast on a small VPS. The fake-live loop needs no server.
- MIDI MANIA: render `.mid` files to MP3 with FluidSynth and a General MIDI soundfont, or play them in the browser with SpessaSynth. MIDI arrangements of copyrighted songs still need a license to be played publicly, so stick to public-domain tunes or originals.
- K-DOG: swap the synthesized barks for CC0 recordings (Freesound) and keep the random conversation sequencer, so it never repeats.
- 3D: a sculpted shrimp (Blender, or bought) exported as Draco-compressed GLB would replace the procedural one. Load it with `GLTFLoader`.
- iOS: the page sets `navigator.audioSession.type = 'playback'` so audio plays with the silent switch on (Safari 16.4+).
