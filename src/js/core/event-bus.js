/**
 * Event Bus - Central pub/sub system for cross-module communication
 *
 * Provides loose coupling between modules by allowing them to communicate
 * through events without direct dependencies.
 *
 * @example
 * import { eventBus } from './core/event-bus.js';
 *
 * // Subscribe to an event
 * const unsubscribe = eventBus.on('timer:started', (data) => {
 *   console.log('Timer started at', data.startTime);
 * });
 *
 * // Emit an event
 * eventBus.emit('timer:started', { startTime: Date.now() });
 *
 * // Unsubscribe
 * unsubscribe();
 */

class EventBus {
  constructor() {
    this.events = new Map();
    this.debugMode = false;
  }

  /**
   * Subscribe to an event
   * @param {string} eventName - The event name to listen to
   * @param {Function} handler - The callback function to execute
   * @returns {Function} Unsubscribe function
   */
  on(eventName, handler) {
    if (!eventName || typeof eventName !== "string") {
      throw new Error("Event name must be a non-empty string");
    }

    if (typeof handler !== "function") {
      throw new Error("Event handler must be a function");
    }

    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    this.events.get(eventName).push(handler);

    if (this.debugMode) {
      console.log(`[EventBus] Subscribed to "${eventName}"`);
    }

    // Return unsubscribe function
    return () => this.off(eventName, handler);
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventName - The event name
   * @param {Function} handler - The handler to remove
   */
  off(eventName, handler) {
    if (!this.events.has(eventName)) return;

    const handlers = this.events.get(eventName);
    const index = handlers.indexOf(handler);

    if (index > -1) {
      handlers.splice(index, 1);

      if (this.debugMode) {
        console.log(`[EventBus] Unsubscribed from "${eventName}"`);
      }
    }

    // Clean up empty handler arrays
    if (handlers.length === 0) {
      this.events.delete(eventName);
    }
  }

  /**
   * Emit an event to all subscribers
   * @param {string} eventName - The event name
   * @param {*} data - The data to pass to handlers
   */
  emit(eventName, data) {
    if (!this.events.has(eventName)) {
      if (this.debugMode) {
        console.log(`[EventBus] No subscribers for "${eventName}"`);
      }
      return;
    }

    const handlers = this.events.get(eventName);

    if (this.debugMode) {
      console.log(`[EventBus] Emitting "${eventName}" to ${handlers.length} subscriber(s)`, data);
    }

    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[EventBus] Error in handler for "${eventName}":`, error);
        // Don't throw - allow other handlers to continue
      }
    });
  }

  /**
   * Subscribe to an event that will only fire once
   * @param {string} eventName - The event name
   * @param {Function} handler - The callback function
   * @returns {Function} Unsubscribe function
   */
  once(eventName, handler) {
    const onceHandler = (data) => {
      handler(data);
      this.off(eventName, onceHandler);
    };

    return this.on(eventName, onceHandler);
  }

  /**
   * Remove all handlers for an event, or all events if no name provided
   * @param {string} [eventName] - Optional event name to clear
   */
  clear(eventName) {
    if (eventName) {
      this.events.delete(eventName);
      if (this.debugMode) {
        console.log(`[EventBus] Cleared all handlers for "${eventName}"`);
      }
    } else {
      this.events.clear();
      if (this.debugMode) {
        console.log("[EventBus] Cleared all event handlers");
      }
    }
  }

  /**
   * Get the number of subscribers for an event
   * @param {string} eventName - The event name
   * @returns {number} Number of subscribers
   */
  listenerCount(eventName) {
    return this.events.has(eventName) ? this.events.get(eventName).length : 0;
  }

  /**
   * Enable or disable debug logging
   * @param {boolean} enabled - Whether to enable debug mode
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    console.log(`[EventBus] Debug mode ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Get all registered event names
   * @returns {string[]} Array of event names
   */
  getEventNames() {
    return Array.from(this.events.keys());
  }
}

// Export singleton instance
export const eventBus = new EventBus();

// Also export the class for testing purposes
export {EventBus};
