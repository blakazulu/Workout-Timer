# Test Selector Mapping

This document maps test selectors to actual HTML elements in the CYCLE app.

## Timer Elements

| Test Selector            | Actual Selector                         | Element                     |
|--------------------------|-----------------------------------------|-----------------------------|
| `.timer-display`         | `.timer-display` or `#timerDisplay`     | Timer container             |
| `[data-time-display]`    | `#timerValue`                           | Current time display        |
| `[data-set-display]`     | `#repCounter`                           | Set/rep counter             |
| `[data-phase-indicator]` | `#repCounter`                           | Phase indicator (work/rest) |
| Start button             | `#startBtn`                             | Start timer button          |
| Pause button             | `#startBtn` (same button, text changes) | Pause button                |
| Stop/Reset button        | `#resetBtn`                             | Reset timer button          |

## Music/Audio Elements

| Test Selector          | Actual Selector      | Element                  |
|------------------------|----------------------|--------------------------|
| `#player`              | `#player`            | YouTube player container |
| `[data-play-button]`   | `#musicPlayPauseBtn` | Play/pause button        |
| `[data-pause-button]`  | `#musicPlayPauseBtn` | Same as play button      |
| `[data-next-button]`   | N/A                  | Not implemented yet      |
| `[data-volume-slider]` | N/A                  | Volume in YouTube player |
| `[data-now-playing]`   | `#musicTitle`        | Now playing display      |

## Favorites Elements

| Test Selector              | Actual Selector                                     | Element                    |
|----------------------------|-----------------------------------------------------|----------------------------|
| `[data-favorite-button]`   | `.song-favorite-btn[data-action="toggle-favorite"]` | Favorite toggle button     |
| `[data-favorites-section]` | `.history-tab[data-tab="favorites"]` parent         | Favorites section          |
| `[data-favorite-item]`     | `.favorite-item` or `.song-card`                    | Individual favorite        |
| `[data-remove-favorite]`   | `.song-card-remove`                                 | Remove from favorites      |
| `[data-shuffle-favorites]` | `#shuffleFavoritesBtn`                              | Shuffle button             |
| `[data-favorites-count]`   | N/A                                                 | Not displayed (calculated) |
| `[data-favorites-empty]`   | `.history-empty`                                    | Empty state                |

## UI Elements

| Test Selector                  | Actual Selector                                     | Element        |
|--------------------------------|-----------------------------------------------------|----------------|
| `[data-settings-panel]`        | `#settings`                                         | Settings panel |
| `[data-close-button]`          | `.genre-popover-close`, `.mood-popover-close`, etc. | Close buttons  |
| `[data-library-panel]`         | `#musicLibraryPopover`                              | Library panel  |
| `[data-library-button]`        | `#historyBtn`                                       | Library button |
| `[data-genre-selector-button]` | `button[popovertarget="genrePopover"]`              | Genre selector |
| `[data-mood-selector-button]`  | `button[popovertarget="moodPopover"]`               | Mood selector  |
| `[data-genre-popup]`           | `#genrePopover`                                     | Genre popup    |
| `[data-mood-popup]`            | `#moodPopover`                                      | Mood popup     |
| `[data-genre-option]`          | `.genre-tag`                                        | Genre option   |
| `[data-mood-option]`           | `.mood-tag`                                         | Mood option    |

## Search Elements

| Test Selector           | Actual Selector | Element                     |
|-------------------------|-----------------|-----------------------------|
| `[data-search-input]`   | `#youtubeUrl`   | YouTube URL input           |
| `[data-search-results]` | N/A             | Search results (not tested) |
| `[data-search-clear]`   | N/A             | Clear button                |

## Settings Elements

| Test Selector            | Actual Selector | Element                        |
|--------------------------|-----------------|--------------------------------|
| `[data-sounds-toggle]`   | N/A             | Sounds toggle (check settings) |
| `[data-work-time-input]` | `#duration`     | Work time input                |
| `[data-rest-time-input]` | `#restTime`     | Rest time input                |
| `[data-sets-input]`      | `#repetitions`  | Sets/reps input                |

## Overlay Elements

| Test Selector             | Actual Selector              | Element                    |
|---------------------------|------------------------------|----------------------------|
| `[data-session-complete]` | Check for completion overlay | Session complete           |
| `[data-update-overlay]`   | `#updateOverlay`             | Update notification        |
| `[data-backdrop]`         | N/A                          | Backdrop (might not exist) |

## Tab Navigation

| Test Selector            | Actual Selector                      | Element               |
|--------------------------|--------------------------------------|-----------------------|
| `[data-tab="history"]`   | `.history-tab[data-tab="recent"]`    | Recent tab            |
| `[data-tab="favorites"]` | `.history-tab[data-tab="favorites"]` | Favorites tab         |
| `[data-tab-content]`     | `#historyContent`                    | Tab content container |

## Song Cards

| Test Selector          | Actual Selector        | Element            |
|------------------------|------------------------|--------------------|
| `.song-card`           | `.song-card`           | Song card          |
| `.song-card-title`     | `.song-card-title`     | Song title         |
| `.song-card-thumbnail` | `.song-card-thumbnail` | Song thumbnail     |
| `data-video-id`        | `data-video-id`        | Video ID attribute |

## Notes

- Many test selectors need to be updated to match actual HTML
- Some features may not have corresponding UI elements yet
- YouTube search functionality is NOT tested locally (as requested)
- Tests should use existing IDs and classes where possible
