// Client-side SDK for authentication with custom backend
const API_BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

export interface User {
  id: number;
  email: string;
  name?: string;
}

class AuthSDK {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Register a new user
   */
  async register(email: string, password: string, name?: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/api/trpc/auth.register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        json: {
          email,
          password,
          name,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Registration failed");
    }

    const data = await response.json();
    return data.result.data;
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/api/trpc/auth.login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        json: {
          email,
          password,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Login failed");
    }

    const data = await response.json();
    return data.result.data;
  }

  /**
   * Get the current authenticated user
   */
  async getUser(): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/trpc/auth.me`, {
        credentials: "include",
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.result.data;
    } catch (error) {
      console.error("Failed to get user:", error);
      return null;
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/trpc/auth.logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser();
    return !!user;
  }
}

export const sdk = new AuthSDK();
