import { NextRequest, NextResponse } from "next/server";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

if (!OPENWEATHER_API_KEY) {
  throw new Error('OPENWEATHER_API_KEY is not set in environment variables');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing search query" }, { status: 400 });
  }

  try {
    // Add ", Norge" to the query to prioritize Norwegian locations
    const norwegianQuery = `${query}, Norge`;
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(norwegianQuery)}&limit=5&appid=${OPENWEATHER_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('OpenWeatherMap API request failed');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching location data:', error);
    return NextResponse.json(
      { error: "Failed to fetch location data" },
      { status: 500 }
    );
  }
}
