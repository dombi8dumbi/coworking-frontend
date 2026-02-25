import { api } from "./api";

export const createReservation = (payload) => api.post("/api/reservations", payload);
export const getReservations = () => api.get("/api/reservations");
