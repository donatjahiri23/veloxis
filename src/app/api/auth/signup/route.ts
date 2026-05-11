import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { username, password, fullName } = await req.json();

    if (!username || !password || !fullName) {
      return NextResponse.json(
        { error: "Username, password, and full name are required" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    // Create user
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        username: username.toLowerCase(),
        password_hash: hashPassword(password),
        full_name: fullName,
        last_login_at: new Date().toISOString(),
      })
      .select("id, username, full_name, role, plan, is_active, created_at")
      .single();

    if (error) {
      console.error("Signup error:", error);
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
