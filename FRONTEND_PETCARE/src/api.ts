/// <reference types="vite/client" />
import axios from "axios";
import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

const API_BASE =
  (import.meta.env.VITE_API_BASE as string) ||
  (import.meta.env.VITE_API_URL as string) ||
  "https://petcare-backend-ig9v.onrender.com";

// ------------------ MAIN CLIENT ------------------
const client: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// client.interceptors.request.use((config) => {
//   const token = sessionStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// }

//=============updated code ==================//

// client.interceptors.request.use((config) => {
//   // OWNER & VET → sessionStorage
//   // ADMIN → localStorage
//   const token =
//     sessionStorage.getItem("token") ||
//     localStorage.getItem("token");

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

/* ============== updated code ==============*/

client.interceptors.request.use((config) => {
  const url = config.url || "";
  if (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/send-otp") ||
    url.includes("/auth/verify-otp")
  ) {
    return config;
  }

  const token =
    sessionStorage.getItem("token") ||
    localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

 
client.interceptors.response.use(
  (resp: AxiosResponse) => resp,
  (err: AxiosError) => {
    console.error("API error:", err.response || err.message);
    return Promise.reject(err);
  }
);

export default client;

// ------------------ TYPES ------------------
export interface Pet {
  id: number;
  name: string;
  species?: string;
  breed?: string;
  dob?: string;
  gender?: string;

  //  OWNER NOTE (not doctor)
  healthStatus?: string;

  photoPath?: string;
  ownerId: number;
}


export type Measurement = {
  id?: string;
  petId?: string;
  type: string;
  value?: number;
  notes?: string;
  measuredAt?: string;
};

// ------------------ PET ENDPOINTS ------------------
export async function apiFetchPets() {
  const res = await client.get("/api/pets");
  return res.data as Pet[];
}

export async function apiCreatePet(p: Pet) {
  const res = await client.post("/api/pets", p);
  return res.data as Pet;
}

export async function apiGetPet(id: string) {
  const res = await client.get(`/api/pets/${id}`);
  return res.data as Pet;
}

export async function apiUploadPetPhoto(petId: string, file: File) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await client.post(`/api/pets/${petId}/photo`, fd, {
  headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data as Pet;
}

// ------------------ MEASUREMENTS ------------------
export async function apiAddMeasurement(petId: string, m: Measurement) {
  const res = await client.post(`/api/pets/${petId}/measurements`, m);
  return res.data;
}

export async function apiGetMeasurements(petId: string, type?: string) {
  const url = type
    ? `/api/pets/${petId}/measurements?type=${type}`
    : `/api/pets/${petId}/measurements`;

  const res = await client.get(url);
  return res.data;
}

// ------------------ OWNER PROFILE ------------------

export type OwnerProfile = {
  id?: number;
  name: string;
  phone: string;
  address: string;
  email?: string;
  photoPath?: string;
};

export async function apiGetOwnerProfile() {
  const res = await client.get("/owner/profile");
  return res.data as OwnerProfile;
}

export async function apiUpdateOwnerProfile(profile: OwnerProfile) {
  const res = await client.put("/owner/profile", profile);
  return res.data as OwnerProfile;
}

// ------------------ CHANGE PASSWORD ------------------

export async function apiChangePassword(oldPassword: string, newPassword: string) {
  const res = await client.put("/api/user/change-password", {
    oldPassword,
    newPassword
  });
  return res.data;
}






// ------------------ MEDICAL RECORDS ------------------
export async function apiListRecords(petId: string) {
  const res = await client.get(`/api/pets/${petId}/records`);
  return res.data;
}

// ------------------ VACCINATIONS ------------------
export async function apiListVaccinations(petId: string) {
  const res = await client.get(`/api/pets/${petId}/vaccinations`);
  return res.data;
}

// ------------------ VETS (OWNER VIEW) ------------------

export type VetPublic = {
  id: number;
  name: string;
  clinicName: string;
  specialization: string;
  phone: string;
  clinicAddress: string;
  photoPath?: string;
};

export async function apiFetchVets() {
  const res = await client.get("/api/vets");
  return res.data as VetPublic[];
}

// ------------------ PET OVERVIEW ------------------
export async function apiGetPetOverview(petId: string) {
  const res = await client.get(`/api/pets/${petId}/overview`);
  return res.data;
}

// ------------------ HEALTH RECORDS ------------------

export type HealthRecord = {
  id?: number;
  petId?: number;
  weight: number;
  temperature: number;
  recordDate: string; // yyyy-mm-dd
  notes?: string;
};

export async function apiGetHealth(petId: string) {
  const res = await client.get(`/api/pets/${petId}/health`);
  return res.data as HealthRecord[];
}

export async function apiAddHealth(
  petId: string,
  record: HealthRecord
) {
  const res = await client.post(
    `/api/pets/${petId}/health`,
    record
  );
  return res.data as HealthRecord;
}

export async function apiUpdatePet(
  petId: string,
  pet: Pet
) {
  const res = await client.put(`/api/pets/${petId}`, pet);
  return res.data as Pet;
}

export const apiListAppointments = async (petId: string) => {
  const res = await client.get(`/pets/${petId}/appointments`);
  return res.data;
};

export async function apiFetchAppointmentsByPet(petId: number) {
  const res = await client.get(`/api/pets/${petId}/appointments`);
  return res.data;
}

// src/pages/vet/types/index.ts

export interface VetAppointment {
  id: number;
  petId: number;
  appointmentDate: string;
  slot: string;
  status: "REQUESTED" | "APPROVED" | "COMPLETED" | "REJECTED";
  petName: string;
  petSpecies?: string;  // <-- string, optional
  petHealthStatus?: string;
  ownerName: string;
  notes?: string;
}


export interface VetProfileData {
  id: number;
  userId: number;
  name: string;
  clinicName: string;
  specialization: string;
  phone: string;
  clinicAddress: string;
  photoPath?: string | null;
  approved: boolean;
  certificatePath?: string | null;
}

export interface DashboardStats {
  total: number;
  pending: number;
  accepted: number;
  completed: number;
  rejected: number;
}

// ------------------ ORDERS ------------------

export type OrderResponseDTO = {
  id: number;
  orderDate: string;

  paymentMethod: "COD" | "ONLINE";
  paymentStatus: "PENDING" | "PAID";
  orderStatus: "CREATED" | "SHIPPED" | "DELIVERED";

  totalAmount: number;

  items: {
    productName: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }[];
};


export async function apiFetchMyOrders() {
  const res = await client.get("/api/orders/my-orders");
  return res.data as OrderResponseDTO[];
}
