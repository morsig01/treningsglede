import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Du må være logget inn for å melde deg av" },
        { status: 401 }
      );
    }

    const { session_id, session_date } = await req.json();
    if (!session_id || !session_date) {
      return NextResponse.json(
        { error: "Mangler nødvendig informasjon" },
        { status: 400 }
      );
    }

    // Delete the registration
    const { error } = await supabase
      .from("registrations")
      .delete()
      .match({
        user_id: session.user.id,
        session_id: session_id,
        session_date: session_date,
      });

    if (error) {
      console.error("Error unregistering:", error);
      return NextResponse.json(
        { error: "Kunne ikke melde deg av økten" },
        { status: 500 }
      );
    }

    // Update the current participants count
    const { data: sessionData, error: getError } = await supabase
      .from("sessions")
      .select("current_participants")
      .eq("id", session_id)
      .single();

    if (!getError && sessionData) {
      const { error: updateError } = await supabase
        .from("sessions")
        .update({ 
          current_participants: Math.max(0, sessionData.current_participants - 1)
        })
        .eq("id", session_id);

      if (updateError) {
        console.error("Error updating participant count:", updateError);
        // Don't return error since the unregistration was successful
      }
    }

    return NextResponse.json(
      { message: "Du er nå avmeldt økten" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in unregister endpoint:", error);
    return NextResponse.json(
      { error: "En feil oppstod under avmelding" },
      { status: 500 }
    );
  }
} 