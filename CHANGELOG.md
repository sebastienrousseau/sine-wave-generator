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

The changelog summarizes the key changes, additions, fixes, and removals in the 0.0.2 release for users upgrading from 0.0.1. I ---

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
