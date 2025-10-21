/**
 * Unit Tests for Storage Module
 * Tests timer settings and song history storage operations
 */

import {expect, test} from "@playwright/test";

test.describe("Storage Module - Timer Settings", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");

    // Import storage module and clear storage
    await page.evaluate(async () => {
      const {loadSettings, saveSettings, clearSettings} =
        await import("/src/js/modules/storage.js");

      window.__testStorage = {
        loadSettings,
        saveSettings,
        clearSettings
      };

      // Clear storage before each test
      localStorage.clear();
    });
  });

  test("should load default settings when none exist", async ({page}) => {
    const settings = await page.evaluate(() => {
      return window.__testStorage.loadSettings();
    });

    expect(settings).toEqual({
      duration: 30,
      alertTime: 3,
      repetitions: 3,
      restTime: 10
    });
  });

  test("should save settings to localStorage", async ({page}) => {
    const customSettings = {
      duration: 45,
      alertTime: 5,
      repetitions: 5,
      restTime: 15
    };

    await page.evaluate((settings) => {
      window.__testStorage.saveSettings(settings);
    }, customSettings);

    const stored = await page.evaluate(() => {
      const data = localStorage.getItem("workout-timer-settings");
      return data ? JSON.parse(data) : null;
    });

    expect(stored).toEqual(customSettings);
  });

  test("should load saved settings", async ({page}) => {
    const customSettings = {
      duration: 60,
      alertTime: 10,
      repetitions: 8,
      restTime: 20
    };

    await page.evaluate((settings) => {
      window.__testStorage.saveSettings(settings);
    }, customSettings);

    const loaded = await page.evaluate(() => {
      return window.__testStorage.loadSettings();
    });

    expect(loaded).toEqual(customSettings);
  });

  test("should merge saved settings with defaults", async ({page}) => {
    // Save partial settings
    await page.evaluate(() => {
      localStorage.setItem("workout-timer-settings", JSON.stringify({
        duration: 45
        // Missing alertTime, repetitions, restTime
      }));
    });

    const loaded = await page.evaluate(() => {
      return window.__testStorage.loadSettings();
    });

    // Should have custom duration but default values for others
    expect(loaded.duration).toBe(45);
    expect(loaded.alertTime).toBe(3);
    expect(loaded.repetitions).toBe(3);
    expect(loaded.restTime).toBe(10);
  });

  test("should clear settings", async ({page}) => {
    const customSettings = {
      duration: 45,
      alertTime: 5,
      repetitions: 5,
      restTime: 15
    };

    await page.evaluate((settings) => {
      window.__testStorage.saveSettings(settings);
      window.__testStorage.clearSettings();
    }, customSettings);

    const exists = await page.evaluate(() => {
      return localStorage.getItem("workout-timer-settings");
    });

    expect(exists).toBeNull();
  });

  test("should handle corrupted JSON gracefully", async ({page}) => {
    await page.evaluate(() => {
      localStorage.setItem("workout-timer-settings", "{invalid json}");
    });

    const settings = await page.evaluate(() => {
      return window.__testStorage.loadSettings();
    });

    // Should return defaults when JSON parsing fails
    expect(settings).toEqual({
      duration: 30,
      alertTime: 3,
      repetitions: 3,
      restTime: 10
    });
  });
});

test.describe("Storage Module - Song History", () => {
  const createMockSong = (id = "test-video") => ({
    videoId: id,
    title: `Test Song ${id}`,
    channel: "Test Channel",
    duration: 180,
    url: `https://youtube.com/watch?v=${id}`
  });

  test.beforeEach(async ({page}) => {
    await page.goto("/");

    // Import storage module and clear storage
    await page.evaluate(async () => {
      const {
        saveSongToHistory,
        getSongHistory,
        clearSongHistory,
        removeSongFromHistory,
        getMostPlayedSongs
      } = await import("/src/js/modules/storage.js");

      window.__testStorage = {
        saveSongToHistory,
        getSongHistory,
        clearSongHistory,
        removeSongFromHistory,
        getMostPlayedSongs
      };

      // Clear storage before each test
      localStorage.clear();
    });
  });

  test("should initialize with empty song history", async ({page}) => {
    const history = await page.evaluate(() => {
      return window.__testStorage.getSongHistory();
    });

    expect(history).toEqual([]);
  });

  test("should save song to history", async ({page}) => {
    const song = createMockSong("video-1");

    await page.evaluate((songData) => {
      window.__testStorage.saveSongToHistory(songData);
    }, song);

    const history = await page.evaluate(() => {
      return window.__testStorage.getSongHistory();
    });

    expect(history).toHaveLength(1);
    expect(history[0].videoId).toBe("video-1");
    expect(history[0].title).toBe(song.title);
    expect(history[0].playCount).toBe(1);
  });

  test("should increment play count for repeated songs", async ({page}) => {
    const song = createMockSong("video-1");

    await page.evaluate((songData) => {
      window.__testStorage.saveSongToHistory(songData);
      window.__testStorage.saveSongToHistory(songData);
      window.__testStorage.saveSongToHistory(songData);
    }, song);

    const history = await page.evaluate(() => {
      return window.__testStorage.getSongHistory();
    });

    expect(history).toHaveLength(1);
    expect(history[0].playCount).toBe(3);
  });

  test("should move repeated song to front of history", async ({page}) => {
    const song1 = createMockSong("video-1");
    const song2 = createMockSong("video-2");
    const song3 = createMockSong("video-3");

    await page.evaluate((songs) => {
      window.__testStorage.saveSongToHistory(songs[0]);
      window.__testStorage.saveSongToHistory(songs[1]);
      window.__testStorage.saveSongToHistory(songs[2]);
      // Play song1 again - should move to front
      window.__testStorage.saveSongToHistory(songs[0]);
    }, [song1, song2, song3]);

    const history = await page.evaluate(() => {
      return window.__testStorage.getSongHistory();
    });

    expect(history).toHaveLength(3);
    expect(history[0].videoId).toBe("video-1"); // Most recent
    expect(history[0].playCount).toBe(2);
  });

  test("should include metadata in song entries", async ({page}) => {
    const song = createMockSong("video-1");

    await page.evaluate((songData) => {
      window.__testStorage.saveSongToHistory(songData);
    }, song);

    const history = await page.evaluate(() => {
      return window.__testStorage.getSongHistory();
    });

    const entry = history[0];
    expect(entry.videoId).toBe(song.videoId);
    expect(entry.title).toBe(song.title);
    expect(entry.channel).toBe(song.channel);
    expect(entry.duration).toBe(song.duration);
    expect(entry.url).toBe(song.url);
    expect(entry.thumbnail).toBeDefined();
    expect(entry.thumbnail).toContain(song.videoId);
    expect(entry.playedAt).toBeDefined();
    expect(entry.playCount).toBe(1);
  });

  test("should remove song from history", async ({page}) => {
    const song1 = createMockSong("video-1");
    const song2 = createMockSong("video-2");

    await page.evaluate((songs) => {
      window.__testStorage.saveSongToHistory(songs[0]);
      window.__testStorage.saveSongToHistory(songs[1]);
      window.__testStorage.removeSongFromHistory("video-1");
    }, [song1, song2]);

    const history = await page.evaluate(() => {
      return window.__testStorage.getSongHistory();
    });

    expect(history).toHaveLength(1);
    expect(history[0].videoId).toBe("video-2");
  });

  test("should clear all song history", async ({page}) => {
    const song1 = createMockSong("video-1");
    const song2 = createMockSong("video-2");

    await page.evaluate((songs) => {
      window.__testStorage.saveSongToHistory(songs[0]);
      window.__testStorage.saveSongToHistory(songs[1]);
      window.__testStorage.clearSongHistory();
    }, [song1, song2]);

    const history = await page.evaluate(() => {
      return window.__testStorage.getSongHistory();
    });

    expect(history).toEqual([]);
  });

  test("should get most played songs", async ({page}) => {
    const song1 = createMockSong("video-1");
    const song2 = createMockSong("video-2");
    const song3 = createMockSong("video-3");

    await page.evaluate((songs) => {
      // Song 1: 5 plays
      for (let i = 0; i < 5; i++) {
        window.__testStorage.saveSongToHistory(songs[0]);
      }
      // Song 2: 3 plays
      for (let i = 0; i < 3; i++) {
        window.__testStorage.saveSongToHistory(songs[1]);
      }
      // Song 3: 1 play
      window.__testStorage.saveSongToHistory(songs[2]);
    }, [song1, song2, song3]);

    const mostPlayed = await page.evaluate(() => {
      return window.__testStorage.getMostPlayedSongs(10);
    });

    expect(mostPlayed).toHaveLength(3);
    expect(mostPlayed[0].videoId).toBe("video-1"); // Most played
    expect(mostPlayed[0].playCount).toBe(5);
    expect(mostPlayed[1].videoId).toBe("video-2");
    expect(mostPlayed[1].playCount).toBe(3);
    expect(mostPlayed[2].videoId).toBe("video-3");
    expect(mostPlayed[2].playCount).toBe(1);
  });

  test("should limit most played songs list", async ({page}) => {
    // Create 15 songs
    const songs = Array.from({length: 15}, (_, i) =>
      createMockSong(`video-${i + 1}`)
    );

    await page.evaluate((songList) => {
      songList.forEach(song => {
        window.__testStorage.saveSongToHistory(song);
      });
    }, songs);

    const mostPlayed = await page.evaluate(() => {
      return window.__testStorage.getMostPlayedSongs(5);
    });

    expect(mostPlayed).toHaveLength(5);
  });

  test("should persist history across page reloads", async ({page}) => {
    const song = createMockSong("video-1");

    await page.evaluate((songData) => {
      window.__testStorage.saveSongToHistory(songData);
    }, song);

    // Reload page
    await page.reload();

    // Re-import module
    await page.evaluate(async () => {
      const {getSongHistory} = await import("/src/js/modules/storage.js");
      window.__testStorage = {getSongHistory};
    });

    const history = await page.evaluate(() => {
      return window.__testStorage.getSongHistory();
    });

    expect(history).toHaveLength(1);
    expect(history[0].videoId).toBe("video-1");
  });
});
