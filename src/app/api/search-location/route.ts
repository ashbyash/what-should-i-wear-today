import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const KakaoPlaceSchema = z.object({
  place_name: z.string(),
  address_name: z.string(),
  road_address_name: z.string(),
  x: z.string(),
  y: z.string(),
  category_name: z.string(),
});

const KakaoResponseSchema = z.object({
  documents: z.array(KakaoPlaceSchema),
  meta: z.object({
    total_count: z.number(),
    pageable_count: z.number(),
    is_end: z.boolean(),
  }),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: 'query parameter must be at least 2 characters' },
      { status: 400 }
    );
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Kakao API key not configured' },
      { status: 500 }
    );
  }

  try {
    const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json');
    url.searchParams.set('query', query);
    url.searchParams.set('size', '10');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Kakao API error: ${response.status}`);
    }

    const data = await response.json();
    const validated = KakaoResponseSchema.parse(data);

    return NextResponse.json(validated, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Kakao search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search locations' },
      { status: 500 }
    );
  }
}
