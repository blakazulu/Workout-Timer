/**
 * Unit Tests for Favorites Module
 * Tests favorites storage, add/remove logic, and data management
 */

import {expect, test} from "@playwright/test";

test.describe("Favorites Module - Unit Tests", () => {
  let favoritesModule;

  test.beforeEach(async ({page}) => {
    // Navigate to page and import favorites module
    await page.goto("/");

    // Setup: Import the favorites module
    favoritesModule = await page.evaluate(async () => {
      // Import and expose favorites functions for testing
      const {addFavorite, removeFavorite, getFavorites, isFavorite, clearFavorites} =
        await import("/src/js/modules/favorites/index.js");

      window.__testFavorites = {
        addFavorite,
        removeFavorite,
        getFavorites,
        isFavorite,
        clearFavorites
      };

      return true;
    });

    // Clear favorites before each test
    await page.evaluate(() => {
      if (window.__testFavorites) {
        window.__testFavorites.clearFavorites();
      }
    });
  });

  test("should initialize with empty favorites list", async ({page}) => {
    const favorites = await page.evaluate(() => {
      return window.__testFavorites.getFavorites();
    });

    expect(favorites.songs).toEqual([]);
  });

  test("should add a song to favorites", async ({page}) => {
    const videoId = "test-video-123";

    await page.evaluate((id) => {
      window.__testFavorites.addFavorite(id);
    }, videoId);

    const favorites = await page.evaluate(() => {
      return window.__testFavorites.getFavorites();
    });

    expect(favorites.songs).toContain(videoId);
    expect(favorites.songs).toHaveLength(1);
  });

  test("should remove a song from favorites", async ({page}) => {
    const videoId = "test-video-123";

    // Add then remove
    await page.evaluate((id) => {
      window.__testFavorites.addFavorite(id);
      window.__testFavorites.removeFavorite(id);
    }, videoId);

    const favorites = await page.evaluate(() => {
      return window.__testFavorites.getFavorites();
    });

    expect(favorites.songs).not.toContain(videoId);
    expect(favorites.songs).toHaveLength(0);
  });

  test("should check if song is favorited", async ({page}) => {
    const videoId = "test-video-123";

    // Should not be favorited initially
    let isInFavorites = await page.evaluate((id) => {
      return window.__testFavorites.isFavorite(id);
    }, videoId);

    expect(isInFavorites).toBe(false);

    // Add to favorites
    await page.evaluate((id) => {
      window.__testFavorites.addFavorite(id);
    }, videoId);

    // Should now be favorited
    isInFavorites = await page.evaluate((id) => {
      return window.__testFavorites.isFavorite(id);
    }, videoId);

    expect(isInFavorites).toBe(true);
  });

  test("should not add duplicate favorites", async ({page}) => {
    const videoId = "test-video-123";

    // Add same song twice
    await page.evaluate((id) => {
      window.__testFavorites.addFavorite(id);
      window.__testFavorites.addFavorite(id);
    }, videoId);

    const favorites = await page.evaluate(() => {
      return window.__testFavorites.getFavorites();
    });

    expect(favorites.songs).toHaveLength(1);
  });

  test("should handle multiple favorites", async ({page}) => {
    const videoIds = ["video-1", "video-2", "video-3"];

    // Add multiple favorites
    await page.evaluate((ids) => {
      ids.forEach(id => window.__testFavorites.addFavorite(id));
    }, videoIds);

    const favorites = await page.evaluate(() => {
      return window.__testFavorites.getFavorites();
    });

    expect(favorites.songs).toHaveLength(3);
    videoIds.forEach(id => {
      expect(favorites.songs).toContain(id);
    });
  });

  test("should persist favorites to localStorage", async ({page}) => {
    const videoId = "test-video-123";

    await page.evaluate((id) => {
      window.__testFavorites.addFavorite(id);
    }, videoId);

    // Check localStorage directly
    const storedFavorites = await page.evaluate(() => {
      const stored = localStorage.getItem("favorites");
      return stored ? JSON.parse(stored) : null;
    });

    expect(storedFavorites).toBeTruthy();
    expect(storedFavorites.songs).toContain(videoId);
  });

  test("should restore favorites from localStorage on init", async ({page}) => {
    // Manually set localStorage
    await page.evaluate(() => {
      localStorage.setItem("favorites", JSON.stringify({
        songs: ["video-1", "video-2"],
        version: 1
      }));
    });

    // Reload page to reinitialize module
    await page.reload();

    // Re-import module
    await page.evaluate(async () => {
      const {getFavorites} = await import("/src/js/modules/favorites/index.js");
      window.__testFavorites = {getFavorites};
    });

    const favorites = await page.evaluate(() => {
      return window.__testFavorites.getFavorites();
    });

    expect(favorites.songs).toHaveLength(2);
    expect(favorites.songs).toContain("video-1");
    expect(favorites.songs).toContain("video-2");
  });

  test("should clear all favorites", async ({page}) => {
    // Add multiple favorites
    await page.evaluate(() => {
      window.__testFavorites.addFavorite("video-1");
      window.__testFavorites.addFavorite("video-2");
      window.__testFavorites.addFavorite("video-3");
    });

    // Clear all
    await page.evaluate(() => {
      window.__testFavorites.clearFavorites();
    });

    const favorites = await page.evaluate(() => {
      return window.__testFavorites.getFavorites();
    });

    expect(favorites.songs).toHaveLength(0);
  });

  test("should handle invalid video IDs gracefully", async ({page}) => {
    // Try adding null/undefined/empty
    await page.evaluate(() => {
      window.__testFavorites.addFavorite(null);
      window.__testFavorites.addFavorite(undefined);
      window.__testFavorites.addFavorite("");
    });

    const favorites = await page.evaluate(() => {
      return window.__testFavorites.getFavorites();
    });

    // Should not add invalid IDs
    expect(favorites.songs.filter(s => !s || s === "")).toHaveLength(0);
  });

  test("should maintain favorites order", async ({page}) => {
    const videoIds = ["video-1", "video-2", "video-3"];

    await page.evaluate((ids) => {
      ids.forEach(id => window.__testFavorites.addFavorite(id));
    }, videoIds);

    const favorites = await page.evaluate(() => {
      return window.__testFavorites.getFavorites();
    });

    // Order should match insertion order
    expect(favorites.songs[0]).toBe("video-1");
    expect(favorites.songs[1]).toBe("video-2");
    expect(favorites.songs[2]).toBe("video-3");
  });
});
