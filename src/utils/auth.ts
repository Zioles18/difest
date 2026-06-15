/**
 * Simple mock authentication utility
 */
export const auth = {
  isAuthenticated: (): boolean => {
    return localStorage.getItem("NexBiz_auth") === "true";
  },
  login: (email?: string) => {
    localStorage.setItem("NexBiz_auth", "true");
    if (email) localStorage.setItem("NexBiz_current_email", email);
  },
  logout: () => {
    localStorage.removeItem("NexBiz_auth");
    localStorage.removeItem("NexBiz_current_email");
  },
  getCurrentEmail: (): string | null => {
    return localStorage.getItem("NexBiz_current_email");
  }
};
