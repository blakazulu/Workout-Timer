/**
 * Quick test file for event infrastructure
 * Run this in the browser console to verify everything works
 *
 * Usage: Import this file temporarily in app.js or run in dev tools
 */

import { eventBus } from './event-bus.js';
import { appState } from './app-state.js';
import { EVENTS } from './events.js';

console.log('🧪 Testing Event Infrastructure...\n');

// Test 1: Event Bus Basic Operations
console.log('Test 1: Event Bus - Subscribe and Emit');
let test1Result = null;
const unsubscribe1 = eventBus.on('test:event', (data) => {
  test1Result = data.message;
});
eventBus.emit('test:event', { message: 'Hello from event bus!' });
console.log('✓ Event received:', test1Result);
unsubscribe1();

// Test 2: Event Bus Once
console.log('\nTest 2: Event Bus - Once');
let onceCount = 0;
eventBus.once('test:once', () => {
  onceCount++;
});
eventBus.emit('test:once');
eventBus.emit('test:once');
console.log('✓ Once handler called:', onceCount, 'times (should be 1)');

// Test 3: App State Get/Set
console.log('\nTest 3: App State - Get/Set');
appState.set('timer.isRunning', true);
const isRunning = appState.get('timer.isRunning');
console.log('✓ Timer running state:', isRunning);

// Test 4: App State with Event Integration
console.log('\nTest 4: App State - Change Notifications');
let stateChangeReceived = false;
const unsubscribe4 = appState.subscribe('timer.currentTime', ({ value, oldValue }) => {
  console.log(`✓ State changed from ${oldValue} to ${value}`);
  stateChangeReceived = true;
});
appState.set('timer.currentTime', 120);
unsubscribe4();

// Test 5: Event Constants
console.log('\nTest 5: Event Constants');
console.log('✓ EVENTS object loaded with', Object.keys(EVENTS).length, 'event types');
console.log('✓ Sample events:', EVENTS.TIMER_STARTED, EVENTS.MUSIC_PLAYING);

// Test 6: Real-world Scenario
console.log('\nTest 6: Real-world Scenario - Timer Start');
eventBus.on(EVENTS.TIMER_STARTED, ({ startTime }) => {
  console.log('✓ Timer module emitted start event');
  appState.set('timer.isRunning', true);
});

appState.subscribe('timer.isRunning', ({ value }) => {
  console.log('✓ UI received state change, isRunning:', value);
});

// Simulate timer module starting
eventBus.emit(EVENTS.TIMER_STARTED, { startTime: Date.now() });

console.log('\n✅ All infrastructure tests completed!');
console.log('\nYou can now safely use:');
console.log('- eventBus.on()/emit() for cross-module communication');
console.log('- appState.get()/set() for centralized state');
console.log('- EVENTS.* constants for type-safe event names');
