import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Middleware to check admin role
async function checkAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return null;
}

// Get all sessions
export async function GET(req: NextRequest) {
  const authError = await checkAdmin(req);
  if (authError) return authError;

  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('date', { ascending: true });

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
  const authError = await checkAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { title, instructor, date, time, max_participants, description } = body;

    // Validate required fields
    if (!title || !instructor || !date || !time || !max_participants) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert([{
        title,
        instructor,
        date,
        time,
        max_participants,
        current_participants: 0,
        description
      }])
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