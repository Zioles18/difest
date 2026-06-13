/**
 * Simple mock authentication utility
 */
export const auth = {
  isAuthenticated: (): boolean => {
    return localStorage.getItem("lumina_auth") === "true";
  },
  login: (email?: string) => {
    localStorage.setItem("lumina_auth", "true");
    if (email) localStorage.setItem("lumina_current_email", email);
  },
  logout: () => {
    localStorage.removeItem("lumina_auth");
    localStorage.removeItem("lumina_current_email");
  },
  getCurrentEmail: (): string | null => {
    return localStorage.getItem("lumina_current_email");
  }
};
