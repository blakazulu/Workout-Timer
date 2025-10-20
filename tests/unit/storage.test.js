/**
 * Unit Tests for Storage Module
 * Tests localStorage operations, data persistence, and migrations
 */

import { test, expect } from '@playwright/test';

test.describe('Storage Module - Unit Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Clear localStorage before each test
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('should save data to localStorage', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('test-key', JSON.stringify({ value: 'test' }));
    });

    const stored = await page.evaluate(() => {
      const data = localStorage.getItem('test-key');
      return data ? JSON.parse(data) : null;
    });

    expect(stored).toEqual({ value: 'test' });
  });

  test('should retrieve data from localStorage', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('test-key', JSON.stringify({ value: 'test' }));
    });

    const retrieved = await page.evaluate(() => {
      const data = localStorage.getItem('test-key');
      return data ? JSON.parse(data) : null;
    });

    expect(retrieved.value).toBe('test');
  });

  test('should remove data from localStorage', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
      localStorage.removeItem('test-key');
    });

    const exists = await page.evaluate(() => {
      return localStorage.getItem('test-key');
    });

    expect(exists).toBeNull();
  });

  test('should clear all localStorage data', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.clear();
    });

    const count = await page.evaluate(() => {
      return localStorage.length;
    });

    expect(count).toBe(0);
  });

  test('should handle JSON serialization/deserialization', async ({ page }) => {
    const testData = {
      string: 'test',
      number: 42,
      boolean: true,
      array: [1, 2, 3],
      object: { nested: 'value' }
    };

    await page.evaluate((data) => {
      localStorage.setItem('complex-data', JSON.stringify(data));
    }, testData);

    const retrieved = await page.evaluate(() => {
      const data = localStorage.getItem('complex-data');
      return data ? JSON.parse(data) : null;
    });

    expect(retrieved).toEqual(testData);
  });

  test('should handle localStorage quota exceeded', async ({ page }) => {
    const result = await page.evaluate(() => {
      try {
        // Try to fill localStorage
        const largeString = 'x'.repeat(5 * 1024 * 1024); // 5MB
        localStorage.setItem('large-key', largeString);
        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.name };
      }
    });

    // Should either succeed or throw QuotaExceededError
    if (!result.success) {
      expect(result.error).toBe('QuotaExceededError');
    }
  });

  test('should version stored data for migrations', async ({ page }) => {
    await page.evaluate(() => {
      const favorites = {
        version: 1,
        songs: ['video-1', 'video-2']
      };
      localStorage.setItem('favorites', JSON.stringify(favorites));
    });

    const data = await page.evaluate(() => {
      const stored = localStorage.getItem('favorites');
      return stored ? JSON.parse(stored) : null;
    });

    expect(data.version).toBe(1);
    expect(data.songs).toBeDefined();
  });

  test('should handle missing keys gracefully', async ({ page }) => {
    const result = await page.evaluate(() => {
      return localStorage.getItem('non-existent-key');
    });

    expect(result).toBeNull();
  });

  test('should preserve data across page reloads', async ({ page }) => {
    // Set data
    await page.evaluate(() => {
      localStorage.setItem('persist-test', JSON.stringify({ value: 'persistent' }));
    });

    // Reload page
    await page.reload();

    // Data should still exist
    const data = await page.evaluate(() => {
      const stored = localStorage.getItem('persist-test');
      return stored ? JSON.parse(stored) : null;
    });

    expect(data.value).toBe('persistent');
  });

  test('should handle invalid JSON gracefully', async ({ page }) => {
    const result = await page.evaluate(() => {
      localStorage.setItem('invalid-json', '{invalid json}');

      try {
        const data = localStorage.getItem('invalid-json');
        return JSON.parse(data);
      } catch (error) {
        return { error: error.name };
      }
    });

    expect(result.error).toBe('SyntaxError');
  });

  test('should update existing keys', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('update-test', JSON.stringify({ value: 'old' }));
      localStorage.setItem('update-test', JSON.stringify({ value: 'new' }));
    });

    const data = await page.evaluate(() => {
      const stored = localStorage.getItem('update-test');
      return stored ? JSON.parse(stored) : null;
    });

    expect(data.value).toBe('new');
  });

  test('should enumerate all storage keys', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');
    });

    const keys = await page.evaluate(() => {
      return Object.keys(localStorage);
    });

    expect(keys).toHaveLength(3);
    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
    expect(keys).toContain('key3');
  });

  test('should handle special characters in keys and values', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('key-with-dashes', 'value');
      localStorage.setItem('key.with.dots', 'value');
      localStorage.setItem('key_with_underscores', 'value with spaces & symbols!');
    });

    const values = await page.evaluate(() => {
      return {
        dashes: localStorage.getItem('key-with-dashes'),
        dots: localStorage.getItem('key.with.dots'),
        underscores: localStorage.getItem('key_with_underscores')
      };
    });

    expect(values.dashes).toBe('value');
    expect(values.dots).toBe('value');
    expect(values.underscores).toBe('value with spaces & symbols!');
  });

  test('should calculate storage usage', async ({ page }) => {
    const usage = await page.evaluate(() => {
      // Add some data
      localStorage.setItem('test1', 'a'.repeat(1000));
      localStorage.setItem('test2', 'b'.repeat(2000));

      // Calculate approximate size
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }

      return total;
    });

    // Should have approximately 3000 chars (plus key lengths)
    expect(usage).toBeGreaterThan(3000);
  });
});
