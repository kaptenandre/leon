# Shrimptech Radio (sketch)

A one-page parody radio station: glossy American FM/AM look, a spinning 3D shrimp in WebGL, LIVE bugs everywhere, six channel buttons that recolor the same page, a breaking news crawl, a shrimp stock ticker and a sponsor row.

It is one static file, `index.html`, and lives apart from the LÉON site: nothing in `src/` or the Netlify build reads this folder. Preview it with any static server:

```sh
npx serve shrimptech   # then open the printed URL
```

## How it works

- **3D shrimp**: Three.js 0.170 from jsDelivr through an import map. The shrimp is built in code (a segmented body swept along a curve, legs, swimmerets, antennae, rostrum, tail fan) with a clearcoat `MeshPhysicalMaterial`, a `RoomEnvironment` for reflections and bloom on top. Each channel swaps the look: natural, low-poly (MIDI MANIA), floppy ears and tongue (K-DOG), gold, iridescent, chrome. The canvas covers the window and the camera offset keeps the shrimp centered on `#stage` wherever it sits on the page. If WebGL or the CDN fails, a spinning emoji takes its place.
- **"Live" audio without a stream**: every channel is scheduled against the wall clock, so all listeners hear the same moment, like a broadcast. With no audio files, each channel is synthesized in Web Audio: a smooth-jazz bed (SHRIMP FM), doo-wop with vinyl crackle (SHRIMP GOLD), 808 R&B (THE PRAWN), a narrow AM-band talk bed (SHRIMP TALK), square-wave versions of public-domain tunes (MIDI MANIA) and two synthesized dogs panned left and right with translated subtitles (K-DOG). The DJ talks through the browser's speech synthesis and the music ducks under it.
- **Real audio files**: set `src` on a channel in `CHANNELS`, for example `src: 'audio/shrimp-fm.mp3'`. The file loops and starts at `now % duration`, so it still behaves like a 24/7 stream, and a visitor only downloads the file once. The host has to answer HTTP Range requests (Netlify does), or the browser can't seek and every visitor starts at 0:00. If the file is missing, the synth version plays.
- **Deep links**: `?ch=midi-mania` or `#midi-mania` opens a channel.
- **Extras**: tuning static between channels, a laser sweeper before station IDs, an LED spectrum on the LCD, and a request line button that dials 1-800-SHRIMP-1 in DTMF and gets a busy signal.

## Production notes

- Hosting: static files on Netlify (same setup as LÉON). Long MP3 loops are fine; for heavy traffic put the audio on a CDN bucket (Cloudflare R2, Bunny) to keep bandwidth cheap.
- A real 24/7 stream with live DJs and a now-playing API would need Icecast or AzuraCast on a small VPS. The fake-live loop above needs no server.
- MIDI MANIA: render `.mid` files to MP3 with FluidSynth and a General MIDI soundfont, or play them in the browser with SpessaSynth. MIDI arrangements of copyrighted songs still need a license to be played publicly, so stick to public-domain tunes or originals.
- K-DOG: swap the synthesized barks for CC0 recordings (Freesound) and keep the random conversation sequencer, so it never repeats.
- 3D: a sculpted shrimp (Blender, or bought) exported as Draco-compressed GLB would replace the procedural one. Load it with `GLTFLoader`.
- iOS: the page sets `navigator.audioSession.type = 'playback'` so audio plays with the silent switch on (Safari 16.4+).
