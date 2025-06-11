import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!user_id || !from || !to) {
    return NextResponse.json({ error: "Mangler parametre" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("registrations")
    .select("id, session_id, session_date")
    .eq("user_id", user_id)
    .gte("session_date", from)
    .lte("session_date", to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ registrations: data });
} 