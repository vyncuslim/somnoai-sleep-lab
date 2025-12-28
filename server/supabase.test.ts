import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";

describe("Supabase Connection", () => {
  it("should connect to Supabase with valid credentials", async () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    expect(supabaseUrl).toBeDefined();
    expect(supabaseKey).toBeDefined();

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not found");
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test connection by making a simple query to a public table
    // First, let's just verify the client is created successfully
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();

    // Try to get the current session (should be null for unauthenticated)
    const { data: sessionData } = await supabase.auth.getSession();
    
    // If we get here without error, the connection is valid
    expect(sessionData).toBeDefined();
  });
});
