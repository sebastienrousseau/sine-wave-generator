/**
 * sine-wave-generator.js v0.0.3
 *
 * A JavaScript library designed for generating animated sine waves on a canvas,
 * offering configurable parameters, easing functions for smooth animations, and
 * support for multiple waves with individual configurations.
 *
 * Website:
 *
 * https://sine-wave-generator.com
 *
 * Source:
 *
 * https://github.com/sebastienrousseau/sine-wave-generator
 *
 * @requires Ease
 * @requires Wave
 * @requires sine-wave-generator
*/

"use strict";

/**
 * @typedef {Object} WaveConfig
 * @property {number} [phase=Math.random() * Math.PI * 2] - The phase of the wave.
 * @property {number} [speed=Math.random() * 0.5 + 0.5] - The speed of the wave.
 * @property {number} [amplitude=DEFAULT_AMPLITUDE] - The amplitude of the wave.
 * @property {number} [wavelength=DEFAULT_WAVELENGTH] - The wavelength of the wave.
 * @property {string|null} [strokeStyle=DEFAULT_STROKE_STYLE] - The stroke style of the wave.
 * @property {number} [segmentLength=DEFAULT_SEGMENT_LENGTH] - The segment length of the wave (must be > 0).
 * @property {Function} [easing=Ease.sineInOut] - The easing function of the wave.
 * @property {number} [rotate=0] - The rotation angle of the wave.
 */

/**
 * Ease functions for smooth animations.
 * @namespace Ease
 */
const Ease = {
  /**
   * Provides smooth easing in and out animation.
   * @param {number} time - The time parameter.
   * @param {number} amplitude - The amplitude of the wave.
   * @returns {number} - The eased value.
   */
  sineInOut: (time, amplitude) => (amplitude * (Math.sin(time * Math.PI) + 1)) / 2,
  /**
   * Provides eased sine animation.
   * @param {number} percent - The percentage of the animation.
   * @param {number} amplitude - The amplitude of the wave.
   * @returns {number} - The eased value.
   */
  easedSine: (percent, amplitude) => {
    let value;
    const goldenSection = (1 - 1 / 1.618033988749895) / 2;
    if (percent < goldenSection) {
      value = 0;
    } else if (percent > 1 - goldenSection) {
      value = 0;
    } else {
      const adjustedPercent = (percent - goldenSection) / (1 - 2 * goldenSection);
      value = Math.sin(adjustedPercent * Math.PI) * amplitude;
    }
    return value;
  },
};

// Constants
const DEFAULT_AMPLITUDE = 10;
const DEFAULT_WAVELENGTH = 100;
const DEFAULT_STROKE_STYLE = null;
const DEFAULT_SEGMENT_LENGTH = 10;
const LINE_WIDTH = 2;
const DEFAULT_MAX_PIXEL_RATIO = 2;

/**
 * Represents a wave for the sine wave generator.
 * @class
 */
class Wave {
  /**
   * Creates an instance of Wave.
   * @param {WaveConfig} config - The configuration object for the wave.
   * @throws {Error} Throws an error if any configuration value is invalid.
   */
  constructor({
    phase = Math.random() * Math.PI * 2,
    speed = Math.random() * 0.5 + 0.5,
    amplitude = DEFAULT_AMPLITUDE,
    wavelength = DEFAULT_WAVELENGTH,
    strokeStyle = DEFAULT_STROKE_STYLE,
    segmentLength = DEFAULT_SEGMENT_LENGTH,
    easing = Ease.sineInOut,
    rotate = 0,
  }) {
    this.validateConfig({ amplitude, wavelength, segmentLength, speed, rotate });
    this.phase = phase;
    this.speed = speed;
    this.amplitude = amplitude;
    this.wavelength = wavelength;
    this.strokeStyle = strokeStyle;
    this.segmentLength = segmentLength;
    this.easing = easing;
    this.rotate = rotate;
  }

  /**
   * Validates the configuration values for the wave.
   * @param {Object} param0 - The configuration object.
   * @param {number} param0.amplitude - The amplitude of the wave.
   * @param {number} param0.wavelength - The wavelength of the wave.
   * @param {number} param0.segmentLength - The segment length of the wave.
   * @param {number} param0.speed - The speed of the wave.
   * @param {number} param0.rotate - The rotation angle of the wave.
   * @throws {Error} Throws an error if any configuration value is invalid.
   */
  validateConfig({ amplitude, wavelength, segmentLength, speed, rotate }) {
    if (!Number.isFinite(amplitude) || !Number.isFinite(wavelength)) {
      throw new Error("Amplitude and wavelength must be finite numbers.");
    }
    if (!Number.isFinite(segmentLength) || !Number.isFinite(speed) || !Number.isFinite(rotate)) {
      throw new Error("Segment length, speed, and rotate must be finite numbers.");
    }
    if (amplitude < 0 || wavelength < 0 || segmentLength <= 0 || speed < 0) {
      throw new Error("Wave configuration values must be positive.");
    }
    if (rotate < 0 || rotate >= 360) {
      throw new Error("Rotate value must be between 0 and 360 degrees.");
    }
  }

  /**
   * Generates a random configuration object for the wave.
   * @returns {WaveConfig} - The random configuration object.
   */
  static generateRandomConfig() {
    return {
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.5 + 0.5,
      amplitude: Math.random() * 20 + 5,
      wavelength: Math.random() * 200 + 50,
      strokeStyle: `rgba(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.random().toFixed(1)})`,
      segmentLength: Math.random() * 20 + 5,
      easing: Ease.sineInOut,
      rotate: Math.random() * 360,
    };
  }

  /**
   * Updates the wave's configuration.
   * @param {WaveConfig} config - The new configuration object.
   * @returns {this} - The updated Wave instance.
   */
  update(config) {
    const next = { ...this, ...config };
    this.validateConfig({
      amplitude: next.amplitude,
      wavelength: next.wavelength,
      segmentLength: next.segmentLength,
      speed: next.speed,
      rotate: next.rotate,
    });
    Object.assign(this, config);
    return this;
  }
}

/**
 * Represents a sine wave generator.
 * @class
 */
class SineWaveGenerator {
  /**
   * Creates an instance of SineWaveGenerator.
 * @param {Object} options - The initialization options.
 * @param {HTMLCanvasElement|string} options.el - The canvas element or selector for the canvas.
 * @param {Wave[]|Object[]} [options.waves=[]] - Array of Wave instances or configs to be animated.
 * @param {number} [options.pixelRatio=window.devicePixelRatio] - Device pixel ratio override.
 * @param {number} [options.maxPixelRatio=2] - Maximum pixel ratio cap for memory/perf.
 * @param {boolean} [options.autoResize=true] - Automatically resize on window resize.
   * @throws {Error} Throws an error if the canvas element is not provided.
   */
  constructor({ el, waves = [], pixelRatio, maxPixelRatio = DEFAULT_MAX_PIXEL_RATIO, autoResize = true }) {
    const resolvedEl = typeof el === "string" ? document.querySelector(el) : el;
    if (!resolvedEl || !(resolvedEl instanceof HTMLCanvasElement)) {
      throw new Error("SineWaveGenerator requires a valid canvas element.");
    }
    this.el = resolvedEl;
    this.ctx = this.el.getContext("2d");
    if (!this.ctx) {
      throw new Error("SineWaveGenerator could not acquire a 2D rendering context.");
    }
    this.waves = waves.map((wave) => (wave instanceof Wave ? wave : new Wave(wave)));
    this.handleResize = this.resize.bind(this);
    this.handleMouseMove = this.onMouseMove.bind(this);
    this.handleTouchMove = this.onTouchMove.bind(this);
    this.animationFrameId = null;
    this.touchListenerOptions = { passive: true };
    this.eventsBound = false;
    this.autoResize = autoResize;
    this.pixelRatio =
      typeof pixelRatio === "number" && Number.isFinite(pixelRatio)
        ? pixelRatio
        : window.devicePixelRatio || 1;
    this.maxPixelRatio =
      typeof maxPixelRatio === "number" && Number.isFinite(maxPixelRatio)
        ? Math.max(1, maxPixelRatio)
        : DEFAULT_MAX_PIXEL_RATIO;
    this.displayWidth = 0;
    this.displayHeight = 0;
    this.gradient = null;

    this.bindEvents();
  }

  /**
   * Binds necessary events.
   * @returns {this} - The SineWaveGenerator instance for chaining.
   */
  bindEvents() {
    if (this.eventsBound) {
      return this;
    }
    if (this.autoResize) {
      window.addEventListener("resize", this.handleResize);
    }
    this.el.addEventListener("mousemove", this.handleMouseMove);
    this.el.addEventListener("touchmove", this.handleTouchMove, this.touchListenerOptions);
    this.eventsBound = true;
    return this;
  }

  /**
   * Unbinds events.
   * @returns {this} - The SineWaveGenerator instance for chaining.
   */
  unbindEvents() {
    if (!this.eventsBound) {
      return this;
    }
    if (this.autoResize) {
      window.removeEventListener("resize", this.handleResize);
    }
    this.el.removeEventListener("mousemove", this.handleMouseMove);
    this.el.removeEventListener("touchmove", this.handleTouchMove, this.touchListenerOptions);
    this.eventsBound = false;
    return this;
  }

  /**
   * Handles mouse movement.
   * @param {MouseEvent} event - The mouse event.
   */
  onMouseMove(event) {
    if (this.displayHeight <= 0) {
      return;
    }
    const mouseY = event.clientY / this.displayHeight;
    const clamped = Math.min(1, Math.max(0, mouseY));
    this.waves.forEach((wave) => {
      wave.phase = clamped * Math.PI * 2;
    });
  }

  /**
   * Handles touch movement.
   * @param {TouchEvent} event - The touch event.
   */
  onTouchMove(event) {
    if (!event.touches || event.touches.length === 0) {
      return;
    }
    if (this.displayHeight <= 0) {
      return;
    }
    const touchY = event.touches[0].clientY / this.displayHeight;
    const clamped = Math.min(1, Math.max(0, touchY));
    this.waves.forEach((wave) => {
      wave.phase = clamped * Math.PI * 2;
    });
  }

  /**
   * Starts the animation of waves.
   * @returns {this} - The SineWaveGenerator instance for chaining.
   */
  start() {
    this.bindEvents();
    this.resize();
    if (this.animationFrameId) {
      return this;
    }
    const draw = () => {
      this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
      this.waves.forEach((wave) => this.drawWave(wave));
      this.animationFrameId = requestAnimationFrame(draw);
    };
    this.animationFrameId = requestAnimationFrame(draw);
    return this;
  }

  /**
   * Stops the animation of waves.
   * @returns {this} - The SineWaveGenerator instance for chaining.
   */
  stop() {
    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.unbindEvents();
    return this;
  }

  /**
   * Adjusts the canvas size on window resize to maintain the full-screen effect.
   * @returns {this} - The SineWaveGenerator instance for chaining.
   */
  resize() {
    const rect = this.el.getBoundingClientRect();
    const nextWidth = rect.width || window.innerWidth;
    const nextHeight = rect.height || window.innerHeight;
    this.displayWidth = Math.max(1, Math.floor(nextWidth));
    this.displayHeight = Math.max(1, Math.floor(nextHeight));
    const ratio = Math.min(this.pixelRatio, this.maxPixelRatio);
    const renderWidth = Math.max(1, Math.floor(this.displayWidth * ratio));
    const renderHeight = Math.max(1, Math.floor(this.displayHeight * ratio));
    if (this.el.width !== renderWidth || this.el.height !== renderHeight) {
      this.el.width = renderWidth;
      this.el.height = renderHeight;
      this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    this.gradient = this.ctx.createLinearGradient(0, 0, this.displayWidth, 0);
    this.gradient.addColorStop(0, "rgba(25, 255, 255, 0)");
    this.gradient.addColorStop(0.5, "rgba(255, 25, 255, 0.75)");
    this.gradient.addColorStop(1, "rgba(255, 255, 25, 0)");
    return this;
  }

  /**
   * Draws a wave on the canvas.
   * @param {Wave} wave - The wave to be drawn.
   * @returns {this} - The SineWaveGenerator instance for chaining.
   */
  drawWave(wave) {
    // Method implementation
    this.ctx.save();
    if (wave.rotate) {
      this.ctx.translate(this.displayWidth / 2, this.displayHeight / 2);
      this.ctx.rotate((wave.rotate * Math.PI) / 180);
      this.ctx.translate(-this.displayWidth / 2, -this.displayHeight / 2);
    }

    const easing = wave.easing || Ease.sineInOut;
    const width = this.displayWidth;
    const height = this.displayHeight;
    const step = Math.max(1, Math.floor(wave.segmentLength));
    const twoPi = Math.PI * 2;
    const baseY = height / 2;

    this.ctx.beginPath();
    this.ctx.moveTo(0, baseY);

    for (let xPos = 0; xPos < width; xPos += step) {
      const percent = xPos / width;
      const amp = easing(percent, wave.amplitude);

      const time = (xPos / width) * twoPi + wave.phase;
      const y = Math.sin(time) * amp + baseY;

      this.ctx.lineTo(xPos, y);
    }
    const endAmp = easing(1, wave.amplitude);
    const endY = Math.sin(twoPi + wave.phase) * endAmp + baseY;
    this.ctx.lineTo(width, endY);

    this.ctx.strokeStyle = wave.strokeStyle ?? this.gradient;
    this.ctx.lineWidth = LINE_WIDTH;
    this.ctx.stroke();

    wave.phase += wave.speed * Math.PI * 2;

    this.ctx.restore();

    return this;
  }

  /**
   * Adds a new wave to the generator.
   * @param {WaveConfig} config - The configuration object for the new wave.
   * @returns {this} - The SineWaveGenerator instance for chaining.
   * @throws {Error} Throws an error if the configuration object is not provided.
   */
  addWave(config) {
    if (!config || typeof config !== "object") {
      throw new Error("Invalid wave configuration provided.");
    }
    const newWave = config instanceof Wave ? config : new Wave(config);
    this.waves.push(newWave);
    return this;
  }

  /**
   * Removes a wave from the generator.
   * @param {number} index - The index of the wave to be removed.
   * @returns {this} - The SineWaveGenerator instance for chaining.
   * @throws {Error} Throws an error if the index is out of bounds.
   */
  removeWave(index) {
    if (index < 0 || index >= this.waves.length) {
      throw new Error("Wave index out of bounds.");
    }
    this.waves.splice(index, 1);
    return this;
  }
}

window.SineWaveGenerator = SineWaveGenerator;
