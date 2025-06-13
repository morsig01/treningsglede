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

// Update a trainer
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await checkAdmin(req);
  if (authError) return authError;

  try {
    const { id } = params;
    const body = await req.json();
    const { name, role, bio, image_url, specialties } = body;

    // Validate required fields
    if (!name || !role) {
      return NextResponse.json({ error: "Name and role are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('trainers')
      .update({ name, role, bio, image_url, specialties })
      .eq('id', id)
      .select()
      .single();

    if (error) {
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
    const { id } = params;

    const { error } = await supabase
      .from('trainers')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting trainer:', error);
    return NextResponse.json({ error: "Failed to delete trainer" }, { status: 500 });
  }
} 