import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("trainers")
      .select("id, name")
      .order("name");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ instructors: data });
  } catch (error) {
    console.error('Error fetching trainers:', error);
    return NextResponse.json({ error: "Failed to fetch trainers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("trainers")
      .insert([{ name }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json({ error: "Trainer already exists" }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ instructor: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating trainer:', error);
    return NextResponse.json({ error: "Failed to create trainer" }, { status: 500 });
  }
} 