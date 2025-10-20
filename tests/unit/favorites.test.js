/**
 * Unit Tests for Favorites Module
 * Tests favorites storage, add/remove logic, and data management
 */

import {expect, test} from "@playwright/test";

test.describe("Favorites Module - Unit Tests", () => {
  let favoritesModule;

  // Helper to create mock song data
  const createMockSong = (id = "test-video-123") => ({
    videoId: id,
    title: `Test Song ${id}`,
    channel: "Test Channel",
    duration: 180,
    url: `https://youtube.com/watch?v=${id}`
  });

  test.beforeEach(async ({page}) => {
    // Navigate to page and import favorites module
    await page.goto("/");

    // Setup: Import the favorites module
    favoritesModule = await page.evaluate(async () => {
      // Import favorites functions with correct export names
      const {addToFavorites, removeFromFavorites, getFavorites, isFavorite, clearAllFavorites} =
        await import("/src/js/modules/favorites/index.js");

      window.__testFavorites = {
        addToFavorites,
        removeFromFavorites,
        getFavorites,
        isFavorite,
        clearAllFavorites
      };

      return true;
    });

    // Clear favorites before each test
    await page.evaluate(() => {
      if (window.__testFavorites && window.__testFavorites.clearAllFavorites) {
        window.__testFavorites.clearAllFavorites();
      }
    });
  });

  test("should initialize with empty favorites list", async ({page}) => {
    const favorites = await page.evaluate(() => {
      return window.__testFavorites.getFavorites();
    });

    expect(favorites).toEqual([]);
  });

  test("should add a song to favorites", async ({page}) => {
    const songData = createMockSong("test-video-123");

    await page.evaluate((song) => {
      window.__testFavorites.addToFavorites(song);
    }, songData);

    const favorites = await page.evaluate(() => {
      return window.__testFavorites.getFavorites();
    });

    expect(favorites).toHaveLength(1);
    expect(favorites[0].videoId).toBe(songData.videoId);
    expect(favorites[0].title).toBe(songData.title);
  });

  test("should remove a song from favorites", async ({page}) => {
    const songData = createMockSong("test-video-123");

    // Add then remove
    await page.evaluate((song) => {
      window.__testFavorites.addToFavorites(song);
      window.__testFavorites.removeFromFavorites(song.videoId);
    }, songData);

    const favorites = await page.evaluate(() => {
      return window.__testFavorites.getFavorites();
    });

    expect(favorites).toHaveLength(0);
  });

  test("should check if song is favorited", async ({page}) => {
    const songData = createMockSong("test-video-123");

    // Should not be favorited initially
    let isInFavorites = await page.evaluate((videoId) => {
      return window.__testFavorites.isFavorite(videoId);
    }, songData.videoId);

    expect(isInFavorites).toBe(false);

    // Add to favorites
    await page.evaluate((song) => {
      window.__testFavorites.addToFavorites(song);
    }, songData);

    // Should now be favorited
    isInFavorites = await page.evaluate((videoId) => {
      return window.__testFavorites.isFavorite(videoId);
    }, songData.videoId);

    expect(isInFavorites).toBe(true);
  });

  test("should not add duplicate favorites", async ({page}) => {
    const songData = createMockSong("test-video-123");

    // Add same song twice
    const result = await page.evaluate((song) => {
      const first = window.__testFavorites.addToFavorites(song);
      const second = window.__testFavorites.addToFavorites(song);
      return {first, second};
    }, songData);

    expect(result.first).toBe(true); // First add succeeds
    expect(result.second).toBe(false); // Duplicate fails

    const favorites = await page.evaluate(() => {
      return window.__testFavorites.getFavorites();
    });

    expect(favorites).toHaveLength(1);
  });

  test("should handle multiple favorites", async ({page}) => {
    const song1 = createMockSong("video-1");
    const song2 = createMockSong("video-2");
    const song3 = createMockSong("video-3");

    // Add multiple favorites
    await page.evaluate((songs) => {
      songs.forEach(song => window.__testFavorites.addToFavorites(song));
    }, [song1, song2, song3]);

    const favorites = await page.evaluate(() => {
      return window.__testFavorites.getFavorites();
    });

    expect(favorites).toHaveLength(3);
    expect(favorites.some(f => f.videoId === "video-1")).toBe(true);
    expect(favorites.some(f => f.videoId === "video-2")).toBe(true);
    expect(favorites.some(f => f.videoId === "video-3")).toBe(true);
  });

  test("should persist favorites to localStorage", async ({page}) => {
    const songData = createMockSong("test-video-123");

    await page.evaluate((song) => {
      window.__testFavorites.addToFavorites(song);
    }, songData);

    // Check localStorage directly
    const storedFavorites = await page.evaluate(() => {
      const stored = localStorage.getItem("workout-timer-favorites");
      return stored ? JSON.parse(stored) : null;
    });

    expect(storedFavorites).toBeTruthy();
    expect(Array.isArray(storedFavorites)).toBe(true);
    expect(storedFavorites).toHaveLength(1);
    expect(storedFavorites[0].videoId).toBe(songData.videoId);
  });

  test("should restore favorites from localStorage on init", async ({page}) => {
    // Manually set localStorage with current API format (array of objects)
    const mockFavorites = [
      {
        videoId: "video-1",
        title: "Song 1",
        channel: "Channel 1",
        duration: 180,
        url: "https://youtube.com/watch?v=video-1",
        thumbnail: "https://img.youtube.com/vi/video-1/mqdefault.jpg",
        favoritedAt: new Date().toISOString()
      },
      {
        videoId: "video-2",
        title: "Song 2",
        channel: "Channel 2",
        duration: 200,
        url: "https://youtube.com/watch?v=video-2",
        thumbnail: "https://img.youtube.com/vi/video-2/mqdefault.jpg",
        favoritedAt: new Date().toISOString()
      }
    ];

    await page.evaluate((favorites) => {
      localStorage.setItem("workout-timer-favorites", JSON.stringify(favorites));
    }, mockFavorites);

    // Reload page to reinitialize module
    await page.reload();

    // Re-import module
    await page.evaluate(async () => {
      const {getFavorites, addToFavorites, removeFromFavorites, isFavorite, clearAllFavorites} =
        await import("/src/js/modules/favorites/index.js");
      window.__testFavorites = {
        getFavorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        clearAllFavorites
      };
    });

    const favorites = await page.evaluate(() => {
      return window.__testFavorites.getFavorites();
    });

    expect(favorites).toHaveLength(2);
    expect(favorites[0].videoId).toBe("video-1");
    expect(favorites[1].videoId).toBe("video-2");
  });

  test("should clear all favorites", async ({page}) => {
    const song1 = createMockSong("video-1");
    const song2 = createMockSong("video-2");
    const song3 = createMockSong("video-3");

    // Add multiple favorites
    await page.evaluate((songs) => {
      songs.forEach(song => window.__testFavorites.addToFavorites(song));
    }, [song1, song2, song3]);

    // Clear all
    await page.evaluate(() => {
      window.__testFavorites.clearAllFavorites();
    });

    const favorites = await page.evaluate(() => {
      return window.__testFavorites.getFavorites();
    });

    expect(favorites).toHaveLength(0);
  });

  test("should include metadata in favorite entries", async ({page}) => {
    const songData = createMockSong("test-video-123");

    await page.evaluate((song) => {
      window.__testFavorites.addToFavorites(song);
    }, songData);

    const favorites = await page.evaluate(() => {
      return window.__testFavorites.getFavorites();
    });

    const favorite = favorites[0];

    // Check all expected metadata fields
    expect(favorite.videoId).toBe(songData.videoId);
    expect(favorite.title).toBe(songData.title);
    expect(favorite.channel).toBe(songData.channel);
    expect(favorite.duration).toBe(songData.duration);
    expect(favorite.url).toBe(songData.url);
    expect(favorite.thumbnail).toBeDefined();
    expect(favorite.thumbnail).toContain(songData.videoId);
    expect(favorite.favoritedAt).toBeDefined();
  });

  test("should maintain favorites order (most recent first)", async ({page}) => {
    const song1 = createMockSong("video-1");
    const song2 = createMockSong("video-2");
    const song3 = createMockSong("video-3");

    // Add songs in order
    await page.evaluate(async (songs) => {
      for (const song of songs) {
        window.__testFavorites.addToFavorites(song);
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }, [song1, song2, song3]);

    const favorites = await page.evaluate(() => {
      return window.__testFavorites.getFavorites();
    });

    // Most recent should be first (video-3 added last)
    expect(favorites[0].videoId).toBe("video-3");
    expect(favorites[1].videoId).toBe("video-2");
    expect(favorites[2].videoId).toBe("video-1");
  });

  test("should handle edge cases gracefully", async ({page}) => {
    const results = await page.evaluate(() => {
      const results = {
        nullCheck: window.__testFavorites.isFavorite(null),
        undefinedCheck: window.__testFavorites.isFavorite(undefined),
        emptyCheck: window.__testFavorites.isFavorite(""),
        nonExistentCheck: window.__testFavorites.isFavorite("non-existent-id")
      };
      return results;
    });

    // All edge cases should return false, not throw errors
    expect(results.nullCheck).toBe(false);
    expect(results.undefinedCheck).toBe(false);
    expect(results.emptyCheck).toBe(false);
    expect(results.nonExistentCheck).toBe(false);
  });
});
