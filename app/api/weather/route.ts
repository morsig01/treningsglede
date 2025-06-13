import { NextRequest, NextResponse } from "next/server";
import { getWeatherData } from "@/app/utils/weather";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const date = searchParams.get("date");

  if (!lat || !lon || !date) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const weatherData = await getWeatherData(
      parseFloat(lat),
      parseFloat(lon),
      date
    );

    if (!weatherData) {
      return NextResponse.json(
        { error: "Could not fetch weather data" },
        { status: 500 }
      );
    }

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
