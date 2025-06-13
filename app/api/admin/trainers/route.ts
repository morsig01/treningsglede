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

// Get all trainers
export async function GET(req: NextRequest) {
  const authError = await checkAdmin(req);
  if (authError) return authError;

  try {
    const { data, error } = await supabase
      .from('trainers')
      .select('*')
      .order('name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ trainers: data });
  } catch (error) {
    console.error('Error fetching trainers:', error);
    return NextResponse.json({ error: "Failed to fetch trainers" }, { status: 500 });
  }
}

// Create a new trainer
export async function POST(req: NextRequest) {
  const authError = await checkAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { name, role, bio, image_url, specialties } = body;

    // Validate required fields
    if (!name || !role) {
      return NextResponse.json({ error: "Name and role are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('trainers')
      .insert([{ name, role, bio, image_url, specialties }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ trainer: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating trainer:', error);
    return NextResponse.json({ error: "Failed to create trainer" }, { status: 500 });
  }
} 