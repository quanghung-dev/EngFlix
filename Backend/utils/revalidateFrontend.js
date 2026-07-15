const revalidateFrontend = async (tags) => {
    const endpoint = process.env.FRONTEND_REVALIDATE_URL;
    const secret = process.env.CACHE_REVALIDATE_SECRET;
    if (!endpoint || !secret) return false;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${secret}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tags: [...new Set(tags)] }),
            signal: AbortSignal.timeout(4000)
        });
        if (!response.ok) {
            console.error(`Frontend cache revalidation failed with status ${response.status}`);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Frontend cache revalidation failed:', error.message);
        return false;
    }
};

module.exports = {
    revalidateFrontend
};
