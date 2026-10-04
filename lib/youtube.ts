export function extractYoutubeVideoId(input?: string | null): string | null {
  const validId = /^[A-Za-z0-9_-]{11}$/;
  const value = input?.trim();
  if (!value) return null;
  if (validId.test(value)) return value;

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    let videoId: string | null = null;

    if (hostname === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0] || null;
    } else if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(hostname)) {
      if (url.pathname === '/watch') {
        videoId = url.searchParams.get('v');
      } else {
        videoId = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] || null;
      }
    }

    return videoId && validId.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}
