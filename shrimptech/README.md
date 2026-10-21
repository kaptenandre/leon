# Shrimptech Radio (sketch)

A one-page parody American radio station built around the Shrimptech Radio episode: chrome logo, a spinning 3D shrimp on a rising-sun backdrop, LIVE bugs everywhere, five channel buttons that recolor the same page, a breaking news crawl, a stock ticker and a sponsor row.

It is one static file, `index.html`, plus `audio/`, and lives apart from the LÉON site: nothing in `src/` or the LÉON Netlify build reads this folder. Preview it with any static server:

```sh
npx serve shrimptech   # then open the printed URL
```

## How it works

- **Look**: three colors only (sun red, paper cream, ink) plus chrome on the logo, and Helvetica only, in different weights (Helvetica Neue on Apple devices, Arial where Helvetica isn't installed). Buttons are flat. Each channel arranges the three colors differently in the 16-ray rising-sun backdrop; the channel tile's little sun icon shows which.
- **3D shrimp**: Three.js 0.170 from jsDelivr through an import map. The shrimp is built in code (a segmented body swept along a curve, legs, swimmerets, antennae, rostrum, tail fan) with a clearcoat `MeshPhysicalMaterial` and a `RoomEnvironment` for reflections. Each channel swaps the look: natural, chrome, red wireframe, floppy ears and tongue (K-DOG), black lacquer. The canvas covers the window and the camera offset keeps the shrimp centered on `#stage` wherever it sits on the page. If WebGL or the CDN fails, a spinning emoji takes its place.
- **Player**: play button, now playing, a live spectrum, volume and the five channel tiles. `?ch=wind` or `#wind` opens a channel. On phones the play row docks at the bottom of the screen and the channels become a swipeable row.
- **Phones**: no bloom pass, a lower pixel ratio, and the 3D canvas scrolls with the page (ending in a fade under the stage) instead of chasing it from a fixed position. Rendering pauses while it is scrolled out of view.
- **Fake live**: the episode loops from `SHOW_SRC`. Every visitor joins at `(now + offset) % SHOW_LEN`, so it plays like a live broadcast with no streaming server and each visitor downloads the file progressively. Sources are tried in order: stream encodes next to the page (Opus 96 kbps, MP3 128 kbps), then the full 320 kbps file on Dropbox, then small preview encodes. A host has to answer HTTP Range requests (and send CORS headers when it is another origin, as `dl.dropboxusercontent.com` does). `SHOW_LEN` is fixed so every source lands on the same second.
- **Fast start**: once the page is idle, the channel on screen gets its audio element, pointed at the stream and parked at the live position; a pointer or finger heading for play or a channel does the same for that channel (and fetches the MIDI files or the barks). Pressing play then only has to start it. Until the program is actually on, the play button shows a running ring and the player says TUNING IN. Streaming from Dropbox took 3 to 5.6 s to start; see the deploy notes below.
- **Closed captions**: a TV-style CC box on the stage shows what is being said right now (`SHOW_CC`, transcribed with Whisper) and the song title during music. The ON AIR card shows who is in the studio at this point of the loop (`SHOW_GUESTS`).

## Channels

| Freq | Channel | What plays |
| --- | --- | --- |
| 106.9420 | SHRIMPTECH RADIO 1 | The episode, in sync with the wall clock |
| 106.9421 | SHRIMPTECH RADIO 2 | The same episode, half a loop later |
| 88.1 | VIAGRA BOYS IN MIDI | Viagra Boys songs as MIDI, played by a small General MIDI synth in Web Audio |
| 99.5 | K-DOG | The Dog Conversation Channel: two dogs, real barks, translated subtitles |
| 87.7 | WIND | Just wind. 24/7. |

- **VIAGRA BOYS IN MIDI** plays the album *viagr aboys* from General MIDI files in `midi/`, listed in `MIDI_FILES`. Drums go to a synthesized kit, bass, pianos and leads to simple oscillators, all on the shared wall clock. If the files can't be loaded it falls back to public-domain placeholder tunes. See [The MIDI files](#the-midi-files).
- **K-DOG** plays single barks cut from `audio/k-dog-barks.mp3`, a sprite built by a small script (onset detection, about 90 barks in big, small and crying groups). Each dog has its own pitch and pan, and a random sequencer keeps the conversation from repeating. To swap the recordings, rebuild the sprite and paste the new `segs` table into `DOG_SPRITE`.
- **WIND** is brown noise through moving band-pass filters with gusts. No file.

## Songs in the episode

Shown in the captions while they play. Each block was matched against the album masters (chroma features of a 40 s excerpt slid across every track; matches score 0.88 to 0.99, the runner-up never above 0.43). The block at 19:25 matches nothing on the album and shows "MUSIC".

| Time | Song |
| --- | --- |
| 0:00 | Man Made of Meat |
| 4:07 | UNO II |
| 10:06 | Pyramid of Health |
| 14:06 | You N33d Me (announced on air as "Sk8erbois") |
| 19:25 | not on the album |
| 25:37 | Medicine for Horses |
| 29:48 | The Bog Body |
| 33:35 | Store Policy |
| 38:14 | Best in Show Pt. IV |
| 46:01 | Dirty Boyz |
| 49:47 | Waterboy |
| 55:01 | River King |

## The MIDI files

`midi/*.mid` are the eleven album tracks transcribed from the WAV masters, one Standard MIDI File each (type 1, one tempo, 4/4), so they open in any DAW too:

| Channel | Program | Part | From |
| --- | --- | --- | --- |
| 10 | drums | kick 36, snare 38, closed hat 42 | onsets in the drum stem, classified by which bands jump (sub lows, snare body and crack, top) |
| 2 | 33 Fingered Bass | bass, one note at a time | Basic Pitch on the bass stem |
| 1 | 81 Saw Lead | the vocal line, moved up an octave or two | Basic Pitch on the vocal stem |
| 3 | 4 Electric Piano | guitars, synths and sax, up to three notes | Basic Pitch on the rest |

How they were made: [Demucs](https://github.com/adefossez/demucs) (`htdemucs`) splits each master into drums, bass, vocals and other; the beat comes from the drum stem; [Basic Pitch](https://github.com/spotify/basic-pitch) (ONNX model) turns the pitched stems into notes; everything is snapped to a 16th-note grid and the grid is turned so the snare lands on 2 and 4. A soft snare under a four-on-the-floor kick doesn't clear the snare rule, so when the snare band is clearly louder on every other beat, those beats get a snare wherever it rises. As a check, each note's pitch class is compared with the two strongest chroma bins of its stem at that moment: 97 to 100 % for the bass, 91 to 97 % for the vocal line and 74 to 98 % for the rest. River King has almost no drums, and Store Policy's snare is too faint to place.

## Fan gate

After ten minutes of listening (counted across visits in `localStorage`), a sheet asks: WANT TO LISTEN MORE? Subscribe to Shrimptech Enterprises with email and phone, or CONTINUE IN EXTREME LOW QUALITY AUDIO.

- **Subscribing** posts to Mailchimp's JSONP endpoint as `EMAIL` and `PHONE`, so nobody leaves the page. Paste the embedded form's action URL (Audience > Signup forms > Embedded forms) into `MAILCHIMP_URL`. Until then the form unlocks full quality but sends nothing, and says so in the console. "Already subscribed" counts as success.
- **Extreme low quality**: mono, band-limited, crushed to about 5 kHz and under 4 bits in an AudioWorklet, with hiss, holes in the signal and the odd buffering. Captions get garbled, the 3D renders at a few pixels, and the badges read 2D LQ MONO. GET FULL QUALITY in the player opens the sheet again.
- `?gate=20` opens the gate after 20 seconds and ignores earlier visits, for testing.

## Easter eggs

Headlines, sponsors (Chicken Water, Raisin Recycling System, Rubber Bucket, Useless Bread, Sauce Slammers, Shrimptech Frozen Shrimp, Shrimpscapes, Milk Tokens) and tickers all come from the episode. Every sponsor links to the Viagra Boys webshop. On top of that:

- Type a word from the show anywhere on the page: `sauce`, `chicken`, `yeehaw`, `dirty`, `felon`, `cringe`, `raisin`, `jamie`. Each plays the matching clip from the episode (`SHOW_CLIPS`), spins the shrimp and counts found eggs on the sticker. `jamie` also pulls something up "on the screen".
- Click the shrimp nine times: caller #9 wins a can of Chicken Water.
- CALL THE STUDIO dials 1-800-SHRIMP-1 in DTMF. Sometimes Ron Dangle picks up, otherwise it's busy.
- At 4:20 ET the clock adds 106.9420.

## Updating the transcript

Captions and clips are generated from a Whisper transcript with word timestamps. To redo them (for example after a new edit of the episode): transcribe with `faster-whisper` (`medium.en`, `word_timestamps=True`), mark the song ranges, and regenerate the `SHOW_CC`, `SHOW_CLIPS` and `PHONE_CLIPS` lines. Update `SHOW_LEN` and `SHOW_GUESTS` if the length or running order changes.

## Production notes

- Hosting: static files on Netlify, published straight from this folder. The stream encodes and previews in `audio/` are too big for git, so they are uploaded with the deploy and not kept here. Make them from the episode with:

  ```sh
  ffmpeg -i Shrimptech-Radio-edit2.mp3 -c:a libopus -b:a 96k -vbr on -application audio -cues_to_front 1 -f webm audio/shrimptech-radio.webm
  ffmpeg -i Shrimptech-Radio-edit2.mp3 -c:a libmp3lame -b:a 128k audio/shrimptech-radio.mp3
  ```

  Without them the page falls back to Dropbox, which works but starts slower and has traffic limits.
- A real 24/7 stream with live DJs and a now-playing API would need Icecast or AzuraCast on a small VPS. The fake-live loop needs no server.
- 3D: a sculpted shrimp (Blender, or bought) exported as Draco-compressed GLB would replace the procedural one. Load it with `GLTFLoader`.
- iOS: the page sets `navigator.audioSession.type = 'playback'` so audio plays with the silent switch on (Safari 16.4+).
