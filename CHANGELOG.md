<!-- markdownlint-disable MD033 MD041 -->

<img
src="https://kura.pro/sinewavegenerator/images/logos/sinewavegenerator.webp"
align="right"
alt="Sine Wave Generator Logo"
height="261"
width="261"
/>

<!-- markdownlint-enable MD033 MD041 -->

# Changelog

![Banner for the Sine Wave Generator][banner]

An enhanced sine wave generator tailored for web applications, offering advanced features for creating dynamic, visually captivating sine waves. Ideal for educational tools, music production software, and creative web projects.

---

## v0.0.3 (2026-01-26)

### Added

- Apple-inspired documentation refresh with new examples and performance guidance
- New options: `pixelRatio`, `maxPixelRatio`, and `autoResize`
- Pause/resume example controls and a performance-tuned demo
- `AudioSync` (`src/audio-sync.js`): analyzes an `HTMLMediaElement` or `MediaStream` via the Web Audio API and derives real-time energy, frequency-band, beat, and BPM metrics
- `SineWaveGenerator.syncToAudio()` / `unsyncAudio()`: bind an `AudioSync` (or any object exposing `update(timestamp)`) so wave amplitude, speed, and rotation react to music, with a configurable per-property metric mapping
- `respectReducedMotion` / `reducedMotionScale` options: honor the user's `prefers-reduced-motion` preference by default, scaling animation speed (or fully pausing) instead of ignoring it, and updating live if the preference changes
- `ariaLabel` option: canvases are now `aria-hidden="true"` by default (decorative), or `role="img"` with the given label when provided
- `pixelRatio` is now tracked automatically (unless explicitly overridden) and updates live via a `matchMedia` listener when the display's pixel density changes
- `autoResize` now also observes the canvas element itself with `ResizeObserver`, catching layout-driven size changes that a window `resize` event alone would miss
- `ValidationError`, `CanvasError`, `AudioSyncError`: a typed error hierarchy (all `instanceof Error`) replacing generic `Error` throws throughout, so consumers can discriminate failure modes with `instanceof`
- `tsconfig.json` and a `typecheck` script: JSDoc-driven type-checking with no added build step
- `colorScheme` option: the default gradient now follows `prefers-color-scheme` live (with a distinct, higher-contrast palette for dark backgrounds), or force `"light"`/`"dark"`
- `useSineWaveGenerator` (`src/use-sine-wave-generator.js`): an optional React hook that creates, starts, and destroys a `SineWaveGenerator` across the component lifecycle. `react` is an optional peer dependency — only required if this file is imported
- Dual ESM/CJS build (via `tsup`) plus a `package.json` `exports` map: `require("@sebastienrousseau/sine-wave-generator")` and `import ... from "@sebastienrousseau/sine-wave-generator"` (and the `/audio-sync`, `/use-sine-wave-generator` subpaths) now both resolve natively. The previous `require(".../src/*.js")` deep-import paths still work unchanged, kept as explicit legacy aliases in the exports map

### Changed

- Responsive canvas sizing now respects element dimensions and device pixel ratio caps
- `strokeStyle` is now honored; set to `null` for the built-in gradient
- `Wave.update()` validates configuration changes before applying
- **Behavior change:** animations now default to respecting `prefers-reduced-motion` (see `respectReducedMotion` above) — pass `respectReducedMotion: false` to restore the previous always-full-speed behavior
- **Behavior change:** canvases now get an `aria-hidden` or `role="img"` attribute by default unless one is already present on the element
- **Behavior change:** the default gradient now varies with `prefers-color-scheme` instead of always using the same colors — pass `colorScheme: "light"` to restore the previous fixed palette
- `AudioSync.detectBeat()` now documents its algorithm basis and known limitations (single-band bass trigger, 60–200 BPM detection range) in JSDoc and the README

### Fixed

- Pointer interactions now clamp to valid ranges for predictable phase updates
- Touch handling now guards against empty touch lists
- The constructor now throws a clear `CanvasError` instead of a raw `ReferenceError` when called without a DOM (e.g. during server-side rendering)

## v0.0.2 (2023-02-20)

### Added

- New `rotate` configuration option to rotate waves ([#15](https://github.com/user/sine-wave-generator/pull/15))
- `Wave.generateRandomConfig()` static method to generate random configs
- `Wave.update()` method to update wave configurations

### Changed

- `Ease` functions now exported instead of inline
- Consistent `this` return for fluent interface

### Fixed

- Bug with phase reset on mobile ([#12](https://github.com/user/sine-wave-generator/issues/12))
- Typo in documentation ([#17](https://github.com/user/sine-wave-generator/pull/17))

### Removed

- Inline gradient configuration, moved to `Wave` class
- Unused `SPEED` constant

### Deprecated

- `setPhase()` instance method, `phase` now public

## v0.0.1 (2023-02-21)

### Functionality

- Supports multiple simultaneous waves with individual configurations
- Includes mouse/touch interactivity to control wave phase
- More configurable with options like rotation, easing functions etc.

### Structure

- Split into classes for Wave and Generator, encapsulates functionality
- Includes jsdoc commenting and type definitions
- Helper utils module for shared logic

### Implementation

- Utilizes requestAnimationFrame for smooth animations
- Implements resize listener for fullscreen canvas
- Includes validation logic for configurations
- Error handling for constructor

### Quality

- Consistent syntax and formatting
- Descriptive variable/function names
- DRY principles followed
- Unused variables cleaned
- Modern JS syntax with classes, arrow fns etc

### Documentation

- Includes jsdoc commenting for classes, methods, and types
- Documents parameters and return values
- Describes purpose and functionality
- Can generate API documentation

[banner]: https://kura.pro/sinewavegenerator/images/titles/title-sinewavegenerator.webp "Title of Sine Wave Generator"
