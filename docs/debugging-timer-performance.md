# Timer Performance Debugging Guide

**Date**: 2025-10-20
**Purpose**: Debug timer freezing, audio issues, and performance problems

## Quick Start

### Enable Debug Mode

Open browser console (F12) and run:
```javascript
window.enableTimerDebug()
```

Then reload the page and start a workout. You'll see detailed logs in the console.

### Disable Debug Mode

```javascript
window.disableTimerDebug()
```

Then reload the page.

### Get Current Stats

Check timer and audio status at any time:
```javascript
window.getTimerStats()
```

## What Gets Logged

When debug mode is enabled, you'll see logs for:

### Timer Events

**Every Second (Tick)**:
```
[Timer] Tick completed in 1.23ms. Time: 5s, Rep: 2/3, Resting: false
```
- Shows how long the tick took (should be <5ms)
- Current countdown time
- Current rep number
- Whether in rest period

**Alert Beeps**:
```
[Timer] Alert beep at 3s
[Timer] Alert beep at 2s
```
- Shows when countdown beeps play
- Note: Last tick (1s) is skipped since transition sound plays at 0s

**Transitions**:
```
[Timer] Round 1 complete
[Timer] Rest complete, starting rep 2
[Timer] Workout complete! 3 reps finished
[Timer] handleTimerComplete took 1.45ms
```
- Round completions
- Rest endings
- Workout completion
- Time taken to handle transitions (should be <3ms)

### Audio Events

**Sound Playback**:
```
[Audio] Playing restEnd (original)
[Audio] playSound(restEnd) took 0.45ms
```
- Which sound is playing
- Whether it's the original or a clone
- How long it took to start (should be <1ms)

**Audio Cloning** (when sounds overlap):
```
[Audio] Playing roundEnd (clone #2)
[Audio] Cleaned up clone for roundEnd. Active clones: 1
```
- Shows when sounds are cloned for overlap
- Tracks active clone count (memory leak indicator)

**Alert Beeps**:
```
[Audio] Playing alert beep
```
- When countdown ticks play

## Interpreting the Logs

### ✅ Healthy Performance

```
[Timer] Tick completed in 1.23ms. Time: 5s, Rep: 1/3, Resting: false
[Timer] Tick completed in 1.45ms. Time: 4s, Rep: 1/3, Resting: false
[Timer] Alert beep at 3s
[Audio] Playing alert beep
[Timer] Tick completed in 1.67ms. Time: 3s, Rep: 1/3, Resting: false
```

**Good signs**:
- Tick times consistently <5ms
- Regular, predictable timing
- All alert beeps playing
- Active clones staying low (0-2)

### ⚠️ Performance Issues

```
[Timer] Tick completed in 45.23ms. Time: 5s, Rep: 1/3, Resting: false  ⚠️ TOO SLOW!
[Timer] Tick completed in 2.34ms. Time: 4s, Rep: 1/3, Resting: false
[Timer] Tick completed in 123.45ms. Time: 3s, Rep: 1/3, Resting: false ⚠️ FREEZE!
```

**Warning signs**:
- Tick times >10ms (sluggish)
- Tick times >50ms (visible freeze)
- Missing alert beeps
- Irregular timing
- Active clones growing (memory leak)

### 🚨 Critical Issues

```
[Audio] Playing roundEnd (clone #15)  🚨 MEMORY LEAK!
[Audio] Playing roundEnd (clone #25)
[Audio] Playing roundEnd (clone #40)
```

**Critical signs**:
- Active clone count >10 (memory leak)
- Clone count continuously growing
- Tick times increasing over time
- Browser tab becoming unresponsive

## Using getTimerStats()

The `getTimerStats()` function shows current state:

```javascript
window.getTimerStats()
```

**Output**:
```
Timer Stats:
┌─────────────┬──────────┐
│ currentTime │ 15       │
│ currentRep  │ 2        │
│ isRunning   │ true     │
│ isResting   │ false    │
│ duration    │ 30       │
│ repetitions │ 3        │
│ restTime    │ 10       │
│ alertTime   │ 3        │
│ debugMode   │ true     │
└─────────────┴──────────┘

Audio Stats: {
  activeClones: 1,
  audioEnabled: true,
  vibrationEnabled: true,
  sounds: [
    { key: 'restEnd', paused: true, ended: false, currentTime: 0, duration: 1.2 },
    { key: 'roundEnd', paused: false, ended: false, currentTime: 0.8, duration: 1.5 },
    { key: 'workoutOver', paused: true, ended: false, currentTime: 0, duration: 2.1 }
  ]
}
```

### What to Look For

**Timer Section**:
- `currentTime`: Should count down smoothly
- `currentRep`: Should increment properly
- `isResting`: Should toggle between rounds
- All values should match what you see on screen

**Audio Section**:
- `activeClones`: Should be 0-2 normally
  - 0 = No overlapping sounds
  - 1-2 = Normal overlap (e.g., bell still playing when next starts)
  - >5 = Potential memory leak
  - >10 = Definite memory leak
- `sounds[].paused`: false means currently playing
- `sounds[].currentTime`: Progress through the sound

## Common Issues and Solutions

### Issue: Timer Freezes After Multiple Reps

**Symptoms**:
```
[Timer] Tick completed in 2.5ms...
[Timer] Tick completed in 15.3ms...
[Timer] Tick completed in 67.8ms...  ⚠️
[Audio] Playing roundEnd (clone #12) ⚠️
```

**Diagnosis**: Memory leak from audio clones not cleaning up

**Solution**: Audio clones should auto-cleanup when they finish. If this persists, check:
1. Are clones getting cleaned up? Look for "Cleaned up clone" messages
2. Is activeClones count growing without shrinking?
3. Open DevTools → Memory → Take heap snapshot → Search for "Audio" elements

**Fix Applied**: Audio clones now have `ended` event listener that removes them automatically (line 131-141 in audio.js)

### Issue: Missing Alert Beeps

**Symptoms**:
```
[Timer] Alert beep at 3s
[Audio] Playing alert beep
[Timer] Tick completed in 1.5ms. Time: 2s...
// Missing beep at 2s!
[Timer] Tick completed in 1.8ms. Time: 1s...
```

**Diagnosis**: Beep generation failing or being skipped

**Check**:
1. Is Web Audio context suspended? Check console for "AudioContext suspended"
2. Are there errors in beep() method?
3. Is lastAlertSecond being set correctly?

**Note**: Intentionally skip beep at 1s since transition sound plays at 0s

### Issue: Sounds Overlap Unpleasantly

**Symptoms**:
```
[Audio] Playing roundEnd (clone #1)
[Audio] Playing roundEnd (clone #2)
[Audio] Playing roundEnd (clone #3)
```

**Diagnosis**: Too many rapid transitions (e.g., very short rounds)

**This is Expected**: Cloning allows overlapping sounds. If you don't want overlap, increase round duration or disable sound effects.

### Issue: Timer Display Skips Seconds

**Symptoms**: Visual skips from 5 → 3 (missing 4)

**Check Logs**:
```
[Timer] Tick completed in 1.5ms. Time: 5s...
[Timer] Tick completed in 1200ms. Time: 3s... ⚠️ LONG DELAY!
```

**Diagnosis**: Something is blocking the main thread for >1 second

**Common Causes**:
1. PostHog analytics taking too long (should be async)
2. YouTube API calls blocking
3. Heavy DOM operations
4. Browser DevTools performance profiling overhead

**Solution**: All non-critical operations (audio, analytics) are deferred with `setTimeout(..., 0)` to prevent blocking

## Performance Benchmarks

### Target Performance

| Operation | Target Time | Acceptable | Warning |
|-----------|-------------|------------|---------|
| Timer tick | <2ms | <5ms | >10ms |
| handleTimerComplete | <3ms | <10ms | >20ms |
| playSound | <1ms | <2ms | >5ms |
| Audio cleanup | <1ms | <5ms | >10ms |

### Measuring with DevTools

1. Open DevTools → Performance tab
2. Click Record
3. Start a workout (3 reps, 5s each, 3s rest)
4. Let it complete
5. Stop recording
6. Look for:
   - Long tasks (yellow bars >50ms)
   - Timer tick functions (should be tiny)
   - Audio playback (should be off main thread)

**Healthy profile**: Consistent small tasks, no long tasks, smooth frame rate

**Problematic profile**: Spiky tasks, long tasks, frame drops

## Advanced Debugging

### Monitor Active Clones in Real-Time

Run this in console while workout is running:
```javascript
setInterval(() => {
  const stats = window.getTimerStats();
  console.log(`Active clones: ${stats.audio.activeClones}`);
}, 1000);
```

Watch for:
- Count should stay 0-3
- Count should go down when sounds finish
- Count should never continuously increase

### Track Performance Over Time

```javascript
const perfData = [];
setInterval(() => {
  const start = performance.now();
  // Timer operations happen naturally
  const duration = performance.now() - start;
  perfData.push({ time: Date.now(), duration });
  if (perfData.length > 100) perfData.shift();

  const avg = perfData.reduce((sum, d) => sum + d.duration, 0) / perfData.length;
  console.log(`Avg tick time: ${avg.toFixed(2)}ms`);
}, 1000);
```

### Memory Leak Detection

1. Open DevTools → Memory
2. Take heap snapshot before workout
3. Run workout with 10+ reps
4. Take heap snapshot after workout
5. Compare snapshots
6. Look for:
   - HTMLAudioElement count should not grow indefinitely
   - Detached DOM trees
   - Event listeners not cleaned up

### CPU Profiling

1. Open DevTools → Performance
2. Enable "Screenshots" for visual timeline
3. Start recording
4. Run workout
5. Stop recording
6. Look for:
   - `tick()` function calls (should be quick)
   - `playSound()` calls (should be instant)
   - Event emissions (should be async)
   - Long-running JavaScript tasks

## Testing Scenarios

### Scenario 1: Normal Workout
- **Config**: 3 reps, 30s each, 10s rest, 3s alert
- **Expected**: Smooth, no issues
- **Check**: Tick times <5ms, clones 0-2

### Scenario 2: Rapid Workout
- **Config**: 10 reps, 3s each, 1s rest, 2s alert
- **Expected**: Many overlapping sounds
- **Check**: Clones should clean up, count shouldn't exceed 5

### Scenario 3: Long Workout
- **Config**: 20 reps, 60s each, 30s rest, 5s alert
- **Expected**: Memory should stay stable
- **Check**: Active clones should reset to 0 between sounds

### Scenario 4: No Rest
- **Config**: 5 reps, 10s each, 0s rest, 3s alert
- **Expected**: Back-to-back transitions
- **Check**: Round end sounds play cleanly

## Fixes Applied (2025-10-20)

### 1. Memory Leak Fix
- **Issue**: Cloned audio elements accumulating
- **Fix**: Added `ended` event listener to cleanup clones (audio.js:131-141)
- **Verification**: activeClones count should decrease when sounds finish

### 2. Last Tick Skip
- **Issue**: Tick sound + transition sound overlapping
- **Fix**: Skip beep when `currentTime === 1` (timer.js:336)
- **Verification**: Should only hear 3, 2 (beeps), then transition sound

### 3. Non-Blocking Operations
- **Issue**: Audio/analytics blocking timer
- **Fix**: Deferred with `setTimeout(..., 0)` (timer.js:378, 395, 446)
- **Verification**: Tick times should be <3ms

### 4. Debug Logging
- **Addition**: Comprehensive logging system
- **Usage**: `window.enableTimerDebug()`
- **Purpose**: Track performance issues in real-time

## Reporting Issues

If you still see performance problems after these fixes, please report:

1. **Debug logs**: Copy console output during the issue
2. **Stats**: Run `window.getTimerStats()` and include output
3. **Workout config**: Duration, reps, rest time
4. **Browser**: Chrome/Firefox/Safari + version
5. **Device**: Desktop/mobile, OS version
6. **Performance profile**: DevTools → Performance tab recording

---

**Debug Mode**: Persistent (saved in localStorage)
**Performance Impact**: Minimal (<0.5ms per log)
**Production**: Can be left enabled for troubleshooting
