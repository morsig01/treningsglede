import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { createServerSupabaseClient } from "@/app/lib/supabase";

// Middleware to check admin role
async function checkAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return null;
}

// Get a single trainer
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await checkAdmin(req);
  if (authError) return authError;

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('trainers')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ trainer: data });
  } catch (error) {
    console.error('Error fetching trainer:', error);
    return NextResponse.json({ error: "Failed to fetch trainer" }, { status: 500 });
  }
}

// Update a trainer
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await checkAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { name, role, bio, image_url, specialties } = body;

    // Validate required fields
    if (!name || !role) {
      return NextResponse.json({ error: "Name and role are required" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('trainers')
      .update({ name, role, bio, image_url, specialties })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ trainer: data });
  } catch (error) {
    console.error('Error updating trainer:', error);
    return NextResponse.json({ error: "Failed to update trainer" }, { status: 500 });
  }
}

// Delete a trainer
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await checkAdmin(req);
  if (authError) return authError;

  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from('trainers')
      .delete()
      .eq('id', params.id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting trainer:', error);
    return NextResponse.json({ error: "Failed to delete trainer" }, { status: 500 });
  }
} 