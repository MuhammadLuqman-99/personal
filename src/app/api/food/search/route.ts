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

function getNutrient(food: USDAFood, name: string): number {
  const n = food.foodNutrients.find(
    (n) => n.nutrientName === name && n.unitName !== 'MG'
  );
  return Math.round((n?.value || 0) * 10) / 10;
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
      const calories = Math.round(getNutrient(f, 'Energy'));
      const protein = getNutrient(f, 'Protein');
      const carbs = getNutrient(f, 'Carbohydrate, by difference');
      const fat = getNutrient(f, 'Total lipid (fat)');
      const brand = f.brandName || f.brandOwner || '';
      const serving = f.servingSize
        ? `${f.servingSize}${f.servingSizeUnit || 'g'}`
        : '100g';

      return {
        name: f.description,
        brand,
        calories_per_100g: calories,
        calories_per_serving: calories,
        protein,
        carbs,
        fat,
        serving_size: serving,
        image: '',
      };
    });

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
