export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const imageUrl = url.searchParams.get('url');
    const fileName = url.searchParams.get('fileName') || 'image.png';

    if (!imageUrl) {
        return new Response(JSON.stringify({ error: 'Missing image URL' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const imageResponse = await fetch(imageUrl);

        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
        }

        const imageBlob = await imageResponse.blob();

        return new Response(imageBlob, {
            headers: {
                'Content-Type': imageResponse.headers.get('Content-Type') || 'image/png',
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to download image', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
