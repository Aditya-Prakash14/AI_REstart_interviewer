"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@/supabase/server";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
  const { email, password, name } = params;
  const supabase = createServerClient();

  try {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select()
      .eq("email", email)
      .single();

    if (existingUser) {
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };
    }

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (authError) {
      throw authError;
    }

    // Save additional user data to the users table
    if (authData.user) {
      const { error: dbError } = await supabase.from("users").insert({
        id: authData.user.id,
        name,
        email,
      });

      if (dbError) {
        throw dbError;
      }
    }

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: any) {
    console.error("Error creating user:", error);

    return {
      success: false,
      message: error.message || "Failed to create account. Please try again.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, password } = params;
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        message:
          error.message || "Failed to log into account. Please try again.",
      };
    }

    return {
      success: true,
      message: "Signed in successfully.",
    };
  } catch (error: any) {
    console.error("Error signing in:", error);

    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

// Sign out user
export async function signOut() {
  const supabase = createServerClient();
  await supabase.auth.signOut();
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createServerClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Get additional user data from the users table
    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!userData) return null;

    return {
      id: user.id,
      name: userData.name,
      email: userData.email,
    } as User;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
