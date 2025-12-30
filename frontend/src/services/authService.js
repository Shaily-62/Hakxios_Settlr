import api from "./api";

export const loginUser = async () => {
  const res = await api.post("/auth/login");
  return res.data;
};