import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the Supabase user for the user
    const { data: { user }, error } = await supabase.auth.admin.getUserById(session.user.id);

    if (error) {
      console.error('Error getting Supabase user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create a session token for the user
    const { data: { session: supabaseSession }, error: sessionError } = await supabase.auth.admin.createSession({
      user_id: user.id
    });

    if (sessionError) {
      console.error('Error creating Supabase session:', sessionError);
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    return NextResponse.json({ data: { session: supabaseSession } });
  } catch (error) {
    console.error('Error in supabase-token route:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 