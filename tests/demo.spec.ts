import { test, expect } from '@playwright/test';

test('shows recordings without connecting to hardware services', async ({ page }) => {
  const backendRequests: string[] = [];
  page.on('request', request => { if (request.url().includes('.supabase.co')) backendRequests.push(request.url()); });
  await page.route('https://api.github.com/repos/brunnojob/IoT-RF-Solucoes', route => route.fulfill({ json: { stargazers_count: 3, forks_count: 1, pushed_at: '2026-10-16T00:00:00Z' } }));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Physical signals. Visible intelligence.' })).toBeVisible();
  await expect(page.locator('video')).toHaveCount(2);
  for (const video of await page.locator('video').all()) {
    await expect(video).toHaveAttribute('autoplay', '');
    await expect(video).toHaveJSProperty('muted', true);
    await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement).readyState)).toBeGreaterThanOrEqual(2);
    await expect(video).toHaveJSProperty('paused', false);
  }
  await expect(page.getByText('3 stars')).toBeVisible();
  expect(backendRequests).toEqual([]);
  await page.getByRole('link', { name: /Open dashboard/ }).click();
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
});

test('keeps source available when GitHub API fails on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('https://api.github.com/**', route => route.fulfill({ status: 403, body: '{}' }));
  await page.goto('/');
  await expect(page.getByText('Repository data unavailable.', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: /View on GitHub/ })).toHaveAttribute('href', 'https://github.com/brunnojob/IoT-RF-Solucoes');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
