/**
 * sine-wave-generator.js v0.0.2
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
 * @property {string} [strokeStyle=DEFAULT_STROKE_STYLE] - The stroke style of the wave.
 * @property {number} [segmentLength=DEFAULT_SEGMENT_LENGTH] - The segment length of the wave.
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
const FIBONACCI = 1.618033988749895;
const DEFAULT_AMPLITUDE = 10;
const DEFAULT_WAVELENGTH = 100;
const DEFAULT_STROKE_STYLE = "rgba(255,255,255,0.2)";
const DEFAULT_SEGMENT_LENGTH = 10;
const LINE_WIDTH = 2;
const SPEED = FIBONACCI;

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
    if (amplitude < 0 || wavelength < 0 || segmentLength < 0 || speed < 0) {
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
   * @param {HTMLElement|string} options.el - The canvas element or selector for the canvas.
   * @param {Wave[]} [options.waves=[]] - Array of Wave instances to be animated.
   * @throws {Error} Throws an error if the canvas element is not provided.
   */
  constructor({ el, waves = [] }) {
    if (!el || !(el instanceof HTMLElement)) {
      throw new Error('SineWaveGenerator requires a valid canvas element.');
    }
    this.el = typeof el === "string" ? document.querySelector(el) : el;
    this.ctx = this.el.getContext("2d");
    this.waves = waves.map((wave) => new Wave(wave));
    this.handleResize = this.resize.bind(this);
    this.handleMouseMove = this.onMouseMove.bind(this);
    this.handleTouchMove = this.onTouchMove.bind(this);
    this.animationFrameId = null;

    this.waveTemplate = [];
    for (let x = 0; x < this.el.width; x += DEFAULT_SEGMENT_LENGTH) {
      this.waveTemplate.push({
        x: x,
        y: 0,
      });
    }

    this.bindEvents();
  }

  /**
   * Binds necessary events.
   * @returns {this} - The SineWaveGenerator instance for chaining.
   */
  bindEvents() {
    window.addEventListener("resize", this.handleResize);
    this.el.addEventListener("mousemove", this.handleMouseMove);
    this.el.addEventListener("touchmove", this.handleTouchMove);
    return this;
  }

  /**
   * Unbinds events.
   * @returns {this} - The SineWaveGenerator instance for chaining.
   */
  unbindEvents() {
    window.removeEventListener("resize", this.handleResize);
    this.el.removeEventListener("mousemove", this.handleMouseMove);
    this.el.removeEventListener("touchmove", this.handleTouchMove);
    return this;
  }

  /**
   * Handles mouse movement.
   * @param {MouseEvent} event - The mouse event.
   */
  onMouseMove(event) {
    const mouseY = event.clientY / this.el.height;
    this.waves.forEach((wave) => {
      wave.phase = mouseY * Math.PI * 2;
    });
  }

  /**
   * Handles touch movement.
   * @param {TouchEvent} event - The touch event.
   */
  onTouchMove(event) {
    const touchY = event.touches[0].clientY / this.el.height;
    this.waves.forEach((wave) => {
      wave.phase = touchY * Math.PI * 2;
    });
  }

  /**
   * Starts the animation of waves.
   * @returns {this} - The SineWaveGenerator instance for chaining.
   */
  start() {
    const draw = () => {
      this.ctx.clearRect(0, 0, this.el.width, this.el.height);
      this.waves.forEach((wave) => this.drawWave(wave));
      this.animationFrameId = requestAnimationFrame(draw);
    };
    draw();
    this.resize();
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
    this.el.width = window.innerWidth / 2;
    this.el.height = window.innerHeight / 2;
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
      this.ctx.translate(this.el.width / 2, this.el.height / 2);
      this.ctx.rotate((wave.rotate * Math.PI) / 45);
      this.ctx.translate(-this.el.width / 2, -this.el.height / 2);
    }

    const easing = wave.easing || Ease.sineInOut;

    const gradient = this.ctx.createLinearGradient(0, 0, this.el.width, 0);
    gradient.addColorStop(0, "rgba(25, 255, 255, 0)");
    gradient.addColorStop(0.5, "rgba(255, 25, 255, 0.75)");
    gradient.addColorStop(1, "rgba(255, 255, 25, 0)");

    const startY = this.el.height / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, startY);

    for (let xPos = 0; xPos < this.el.width; xPos++) {
      const percent = xPos / this.el.width;
      const amp = easing(percent, wave.amplitude);

      const time = ((xPos + wave.phase) * Math.PI * 2) / this.el.width;
      const y = Math.sin(time) * amp + startY;

      this.ctx.lineTo(xPos, y);
    }

    this.ctx.strokeStyle = gradient;
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
    if (!config || typeof config !== 'object') {
      throw new Error('Invalid wave configuration provided.');
    }
    const newWave = new Wave(config);
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
      throw new Error('Wave index out of bounds.');
    }
    this.waves.splice(index, 1);
    return this;
  }
}

window.SineWaveGenerator = SineWaveGenerator;
