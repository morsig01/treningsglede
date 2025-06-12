import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // Use rpc to get user metadata since we can't query auth.users directly
    const { data, error } = await supabase.rpc('get_user_metadata', {
      user_id_input: user_id
    });

    if (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log the metadata to help debug
    console.log('User metadata:', data);

    // Check if user has admin role in metadata
    const isAdmin = data?.role === 'admin';
    console.log('Is admin:', isAdmin);

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ error: "Failed to check admin status" }, { status: 500 });
  }
} 