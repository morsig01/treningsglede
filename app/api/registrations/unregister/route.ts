import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key ONLY on server
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, session_id } = await req.json();

    if (!user_id || !session_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Start a transaction
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("current_participants")
      .eq("id", session_id)
      .single();

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 400 });
    }

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Delete the registration
    const { error: deleteError } = await supabase
      .from("registrations")
      .delete()
      .eq("user_id", user_id)
      .eq("session_id", session_id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    // Update the participant count
    const { error: updateError } = await supabase
      .from("sessions")
      .update({ current_participants: Math.max(0, session.current_participants - 1) })
      .eq("id", session_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unregistering:', error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
