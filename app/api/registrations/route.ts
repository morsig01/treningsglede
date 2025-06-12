import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key ONLY on server
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, session_id, session_date } = await req.json();

    if (!user_id || !session_id || !session_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Start a transaction
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("current_participants, max_participants")
      .eq("id", session_id)
      .single();

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 400 });
    }

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.current_participants >= session.max_participants) {
      return NextResponse.json({ error: "Session is full" }, { status: 400 });
    }

    // Check if user is already registered
    const { data: existing, error: selectError } = await supabase
      .from("registrations")
      .select("id")
      .eq("user_id", user_id)
      .eq("session_id", session_id)
      .eq("session_date", session_date)
      .maybeSingle();

    if (selectError) {
      return NextResponse.json({ error: selectError.message }, { status: 400 });
    }

    if (existing) {
      return NextResponse.json({ error: "You are already registered for this session" }, { status: 409 });
    }

    // Create registration and update participant count
    const { error: registrationError } = await supabase
      .from("registrations")
      .insert([{ user_id, session_id, session_date }]);

    if (registrationError) {
      return NextResponse.json({ error: registrationError.message }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("sessions")
      .update({ current_participants: session.current_participants + 1 })
      .eq("id", session_id);

    if (updateError) {
      // If update fails, try to rollback registration
      await supabase
        .from("registrations")
        .delete()
        .eq("user_id", user_id)
        .eq("session_id", session_id)
        .eq("session_date", session_date);

      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
} 