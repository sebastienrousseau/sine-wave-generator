# Sine Wave Generator

Sine Wave Generator is a fast, canvas-first animation engine for smooth, layered sine waves. You get performance-focused defaults, responsive sizing, and a compact API that fits modern UI work.

## Overview

- **Performance-first rendering** with segment-based drawing and pixel-ratio caps.
- **Multi-wave layering** for depth, parallax, and subtle motion design.
- **Pointer-ready interaction** with passive touch listeners.
- **Predictable configuration** through a small, focused API.

## Get started

Install the package:

```sh
npm install @sebastienrousseau/sine-wave-generator
```

Add a canvas and initialize:

```js
const generator = new SineWaveGenerator({
	el: "#sine",
	maxPixelRatio: 2,
	waves: [{ amplitude: 26, wavelength: 120, speed: 0.8 }],
});

generator.start();
```

Note: Set `strokeStyle` to `null` to use the built-in gradient stroke.

## Examples

See the live examples in `examples/example.html` and the published demos in `docs/index.html`.

- Basic single wave
- Layered wave stacks
- Pointer-reactive waves
- Dynamic add/remove waves
- Performance-tuned mode
- Custom easing curves
- Pause/resume control

## API reference

### `new SineWaveGenerator(options)`

Options:

- `el` **(required)**: `HTMLCanvasElement | string`
- `waves`: `WaveConfig[]` (optional)
- `pixelRatio`: `number` (optional, defaults to display pixel ratio)
- `maxPixelRatio`: `number` (optional, defaults to `2`)
- `autoResize`: `boolean` (optional, defaults to `true`)

### `WaveConfig`

```js
{
  phase?: number,
  speed?: number,
  amplitude?: number,
  wavelength?: number,
  strokeStyle?: string | null,
  segmentLength?: number,
  easing?: (percent, amplitude) => number,
  rotate?: number
}
```

Notes:

- `segmentLength` must be greater than `0`.
- Set `strokeStyle` to `null` to use the built-in gradient stroke.

### Instance methods

- `start()` — Start animation.
- `stop()` — Stop animation and unbind listeners.
- `resize()` — Recalculate canvas size and gradients.
- `addWave(config)` — Add a new wave.
- `removeWave(index)` — Remove a wave by index.

## Performance guide

- **Cap pixel ratio** with `maxPixelRatio` on high-DPI displays to reduce memory usage.
- **Increase segment length** to reduce per-frame points when layering waves.
- **Keep wave count tight** for mobile, where each additional layer costs draw time.

Important: If you set a high `maxPixelRatio`, memory use grows quickly on large canvases.

## Accessibility

The generator is canvas-based; provide fallback text in the DOM and ensure controls (pause/resume) are accessible with keyboard focus if you expose them.

## Browser support

All modern browsers with Canvas 2D support (Chrome, Edge, Safari, Firefox).

## Changelog

See `CHANGELOG.md` for release history.

## License

Apache-2.0 © 2026 Sine Wave Generator. All rights reserved.
