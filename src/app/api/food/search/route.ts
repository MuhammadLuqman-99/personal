import { NextRequest, NextResponse } from 'next/server';

interface USDAFood {
  description: string;
  brandName?: string;
  brandOwner?: string;
  foodNutrients: {
    nutrientName: string;
    value: number;
    unitName: string;
  }[];
  servingSize?: number;
  servingSizeUnit?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY';
    const res = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${apiKey}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const data = await res.json();
    const foods = (data.foods || []) as USDAFood[];

    const results = foods.map((f) => {
      const energyNutrient = f.foodNutrients.find(
        (n) => n.nutrientName === 'Energy' && n.unitName === 'KCAL'
      );
      const calories = Math.round(energyNutrient?.value || 0);
      const brand = f.brandName || f.brandOwner || '';
      const serving = f.servingSize
        ? `${f.servingSize}${f.servingSizeUnit || 'g'}`
        : '100g';

      return {
        name: f.description,
        brand,
        calories_per_100g: calories,
        calories_per_serving: calories,
        serving_size: serving,
        image: '',
      };
    });

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
