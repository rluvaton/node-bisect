import speedometer, { Speedometer } from 'speedometer';
import type { onProgressFn } from './types.js';

export class Progress {
  length: number;
  transferred = 0;
  speed = 0;
  streamSpeed: Speedometer;
  initial = false;
  emitDelay: number;
  eventStart = 0;
  percentage = 0;

  constructor(length: string | number, emitDelay = 1000) {
    this.length = typeof length === 'number' ? length : parseInt(length, 10) || 0;
    this.streamSpeed = speedometer(this.speed || 5000);
    this.emitDelay = emitDelay;
  }

  getRemainingBytes() {
    return this.length - this.transferred;
  }

  getEta() {
    return this.length >= this.transferred ? (this.getRemainingBytes() / this.speed) * 1_000_000_000 : 0;
  }

  flow(chunk: Uint8Array, onProgress: onProgressFn) {
    const chunkLength = chunk.length;
    this.transferred += chunkLength;
    this.speed = this.streamSpeed(chunkLength);
    this.percentage = Math.round((this.transferred / this.length) * 100);
    if (!this.initial) {
      this.eventStart = Date.now();
      this.initial = true;
    }
    if (this.length >= this.transferred || Date.now() - this.eventStart > this.emitDelay) {
      this.eventStart = Date.now();

      onProgress({
        total: this.length,
        transferred: this.transferred,
        speed: this.speed,
        eta: this.getEta(),
        remaining: this.length ? this.getRemainingBytes() : undefined,
        percentage: this.length ? this.percentage : undefined,
      });
    }
  }
}
