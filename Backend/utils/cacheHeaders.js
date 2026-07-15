const setPublicCache = (
    res,
    { browserMaxAge = 60, cdnMaxAge = 300, staleWhileRevalidate = 3600 } = {}
) => {
    if (res.req?.headers?.authorization) {
        res.set('Cache-Control', 'private, no-store, max-age=0');
        res.set('Vercel-CDN-Cache-Control', 'private, no-store');
        return;
    }
    res.set('Cache-Control', `public, max-age=${browserMaxAge}`);
    res.set(
        'Vercel-CDN-Cache-Control',
        `public, s-maxage=${cdnMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`
    );
};

const setPrivateNoStore = (res) => {
    res.set('Cache-Control', 'private, no-store, max-age=0');
    res.set('Vercel-CDN-Cache-Control', 'private, no-store');
};

module.exports = {
    setPublicCache,
    setPrivateNoStore
};
