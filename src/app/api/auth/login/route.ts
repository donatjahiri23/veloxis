import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Find user by username
    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, password_hash, full_name, role, plan, is_active, created_at")
      .eq("username", username.toLowerCase())
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Check password
    if (user.password_hash !== hashPassword(password)) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 403 }
      );
    }

    // Update last login
    await supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", user.id);

    // Return user without password hash
    const { password_hash: _, ...safeUser } = user;

    return NextResponse.json({ user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
