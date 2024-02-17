<!-- markdownlint-disable MD033 MD041 -->

<img
src="https://kura.pro/sinewavegenerator/images/logos/sinewavegenerator.webp"
align="right"
alt="Sine Wave Generator"
height="261"
width="261"
/>

<!-- markdownlint-enable MD033 MD041 -->

# sine-wave-generator.js

![Banner for the Sine Wave Generator][banner]

An enhanced sine wave generator tailored for web applications, offering advanced features for creating dynamic, visually captivating sine waves. Ideal for educational tools, music production software, and creative web projects.

## Installation

Install using npm for easy incorporation into your project:

```sh
npm install sine-wave-generator
```

## Usage

```js
import {SineWaveGenerator} from 'sine-wave-generator';

const waves = [/* array of Wave configs */];

const generator = new SineWaveGenerator({
  el: '#sineCanvas',
  waves
});

generator.start();
```

## Examples

Check out the [examples](/examples) directory for a complete set of usage examples, including:

- Basic single wave
- Multiple waves configuration
- Interactive mouse movement
- Dynamic wave management

## API

### SineWaveGenerator(options)

Initializes the sine wave generator with the provided options.

#### options

Type: `object`

##### el

Type: `HTMLElement|string`

The canvas element or selector for the canvas.

##### waves

Type: `Wave[]`

Array of `Wave` instances to be animated.

### Wave(config)

Represents a single wave configuration.

#### config

Type: `object`

Configuration object for the wave.

### Instance Methods

#### .start()

Starts the animation of waves.

#### .stop()

Stops the animation of waves.

#### .addWave(config)

Adds a new wave to the animation.

#### .removeWave(index)

Removes a wave from the animation.

## FAQ

### What browsers are supported?

All modern browsers, including Chrome, Firefox, Safari, Edge. Falls back to 2D canvas.

### How do I change the appearance of the waves?

You can customize the waves by changing their configuration options, such as `amplitude`, `wavelength`, `speed`, and `strokeStyle`.

### Can I add interactivity to the waves?

Yes, the `SineWaveGenerator` supports mouse interaction to disturb the waves. You can also extend its functionality by adding event listeners to the canvas.

## Changelog

Check out the [CHANGELOG](CHANGELOG.md) for the latest updates and changes to the project.

## Acknowledgements

I would like to express my appreciation to [sine-waves](https://github.com/isuttell/sine-waves) code repository and its creator, [Isaac Suttell](https://github.com/isuttell), for serving as an incredible source of inspiration.

## Contributing

Pull requests welcome! Please check out the [contribution guidelines](CONTRIBUTING.md).

## License

Apache-2.0 © Copyright 2024 Sine Wave Generator. All rights reserved.

[banner]: https://kura.pro/sinewavegenerator/images/titles/title-sinewavegenerator.webp "Title of Sine Wave Generator"
