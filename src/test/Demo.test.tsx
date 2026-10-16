import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Demo from '@/pages/Demo';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('public demonstration', () => {
  it('renders both complete videos and real GitHub metadata without backend requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stargazers_count: 3, forks_count: 1, pushed_at: '2026-10-16T00:00:00Z' }) });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = render(<MemoryRouter><Demo /></MemoryRouter>);
    await screen.findByText('stars', { exact: false });
    const videos = [...container.querySelectorAll('video')];
    expect(videos).toHaveLength(2);
    for (const video of videos) {
      expect(video.autoplay).toBe(true);
      expect(video.muted).toBe(true);
      expect(video.loop).toBe(true);
      expect(video.controls).toBe(true);
      expect(video.querySelector('source')?.getAttribute('src')).toMatch(/media\/iot2?\.mp4$/);
    }
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.github.com/repos/brunnojob/IoT-RF-Solucoes');
    expect(screen.getByRole('link', { name: /Open dashboard/ })).toHaveAttribute('href', '/dashboard');
  });
  it('preserves access to recordings and source when the GitHub API fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    render(<MemoryRouter><Demo /></MemoryRouter>);
    await screen.findByText('Repository data unavailable.', { exact: false });
    expect(screen.getByRole('link', { name: /View on GitHub/ })).toHaveAttribute('href', 'https://github.com/brunnojob/IoT-RF-Solucoes');
    cleanup();
    await waitFor(() => expect(document.documentElement.lang).toBe('pt-BR'));
  });
});
