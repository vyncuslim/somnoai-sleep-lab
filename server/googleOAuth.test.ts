import { describe, expect, it } from "vitest";

describe("Google OAuth Credentials", () => {
  it("should have valid Google OAuth credentials", () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    expect(clientId).toBeDefined();
    expect(clientSecret).toBeDefined();

    // Validate format - Google Client IDs typically end with .apps.googleusercontent.com
    if (clientId) {
      expect(clientId).toContain(".");
      expect(clientId.length).toBeGreaterThan(10);
    }

    // Validate secret format - typically a long alphanumeric string
    if (clientSecret) {
      expect(clientSecret.length).toBeGreaterThan(10);
    }
  });
});
