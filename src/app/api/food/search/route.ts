import { NextRequest, NextResponse } from 'next/server';

interface OpenFoodFactsProduct {
  product_name?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    'energy-kcal_serving'?: number;
  };
  serving_size?: string;
  brands?: string;
  image_small_url?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10&fields=product_name,nutriments,serving_size,brands,image_small_url`,
      {
        headers: {
          'User-Agent': 'LifeDashboard/1.0 - Personal Use',
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const data = await res.json();
    const products = (data.products || []) as OpenFoodFactsProduct[];

    const results = products
      .filter((p) => p.product_name)
      .map((p) => ({
        name: p.product_name || '',
        brand: p.brands || '',
        calories_per_100g: Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
        calories_per_serving: Math.round(p.nutriments?.['energy-kcal_serving'] || 0),
        serving_size: p.serving_size || '',
        image: p.image_small_url || '',
      }));

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
