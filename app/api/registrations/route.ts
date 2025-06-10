import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key ONLY on server
);

export async function POST(req: NextRequest) {
  const { user_id, session_id, session_date } = await req.json();

  if (!user_id || !session_id || !session_date) {
    return NextResponse.json({ error: "Mangler data" }, { status: 400 });
  }

  // Sjekk om bruker allerede er påmeldt
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
    return NextResponse.json({ error: "Du er allerede påmeldt denne treningen." }, { status: 409 });
  }

  const { error } = await supabase.from("registrations").insert([
    { user_id, session_id, session_date }
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
} 