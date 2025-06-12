import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get all sessions
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ sessions: data });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

// Create a new session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, instructor, date, time, max_participants, description } = body;

    // Validate required fields
    if (!title || !instructor || !date || !time || !max_participants) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert new session
    const { data, error } = await supabase
      .from("sessions")
      .insert([
        {
          title,
          instructor,
          date,
          time,
          max_participants,
          current_participants: 0,
          description
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ session: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
} 