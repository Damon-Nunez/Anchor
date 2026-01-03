import { api } from "../lib/api";
import { setToken } from "../lib/authStorage";

export async function signup(email: string, username: string, password: string) {
  return api("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, username, password }),
  });
}

export async function login(email: string, password: string) {
  const data = await api<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  await setToken(data.token);
  return data;
}
