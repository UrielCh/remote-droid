// patchEventEmitter.ts
import { EventEmitter } from 'events';

const originalOn = EventEmitter.prototype.on;
const originalOnce = EventEmitter.prototype.once;
const originalAddListener = EventEmitter.prototype.addListener;

function warnIfTooMany(this: EventEmitter, eventName: string | symbol) {
  const count = this.listenerCount(eventName);
  const max = 7; // this.getMaxListeners();
  if (count + 1 > max) {
    console.warn(
      `⚠️ Warning: Adding listener #${count + 1} for event "${String(eventName)}" on ${this.constructor.name}. Max is ${max}.`
    );
    console.trace('Stack trace for excessive listener:');
  }
}

EventEmitter.prototype.on = function (
  this: EventEmitter,
  eventName: string | symbol,
  listener: (...args: any[]) => void
) {
  warnIfTooMany.call(this, eventName);
  return originalOn.call(this, eventName, listener);
};

EventEmitter.prototype.addListener = function (
  this: EventEmitter,
  eventName: string | symbol,
  listener: (...args: any[]) => void
) {
  warnIfTooMany.call(this, eventName);
  return originalAddListener.call(this, eventName, listener);
};

EventEmitter.prototype.once = function (
  this: EventEmitter,
  eventName: string | symbol,
  listener: (...args: any[]) => void
) {
  warnIfTooMany.call(this, eventName);
  return originalOnce.call(this, eventName, listener);
};
