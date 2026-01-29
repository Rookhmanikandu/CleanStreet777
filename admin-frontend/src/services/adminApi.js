import axios from "axios";

/**
 * ================= BASE CONFIG =================
 */
const BASE_URL = "http://localhost:5000/api";

const adminApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * ================= INTERCEPTOR =================
 */
adminApi.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("adminToken");
    const volunteerToken = localStorage.getItem("volunteerToken");

    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (volunteerToken) {
      config.headers.Authorization = `Bearer ${volunteerToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * ================= TOKEN HELPERS =================
 * (App.js & components REQUIRE these exports)
 */
export const setAdminToken = (token) => {
  token
    ? localStorage.setItem("adminToken", token)
    : localStorage.removeItem("adminToken");
};

export const setVolunteerToken = (token) => {
  token
    ? localStorage.setItem("volunteerToken", token)
    : localStorage.removeItem("volunteerToken");
};

export const getAdminToken = () => localStorage.getItem("adminToken");
export const getVolunteerToken = () => localStorage.getItem("volunteerToken");

export const removeAdminToken = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
};

export const removeVolunteerToken = () => {
  localStorage.removeItem("volunteerToken");
  localStorage.removeItem("volunteerUser");
};

/**
 * ================= ADMIN AUTH API =================
 */
export const adminAuthAPI = {
  login: async (data) => {
    const res = await adminApi.post("/auth/admin/login", data);
    return res.data;
  },

  register: async (data) => {
    const res = await adminApi.post("/auth/admin/register", data);
    return res.data;
  },

  getMe: async () => {
    const res = await adminApi.get("/auth/admin/me");
    return res.data;
  },
};

/**
 * ================= VOLUNTEER AUTH API =================
 */
export const volunteerAuthAPI = {
  register: async (data) => {
    const res = await adminApi.post("/auth/volunteer/register", data);
    return res.data;
  },

  login: async (data) => {
    const res = await adminApi.post("/auth/volunteer/login", data);
    return res.data;
  },

  getMe: async () => {
    const res = await adminApi.get("/auth/volunteer/me");
    return res.data;
  },
};

/**
 * ================= ADMIN COMPLAINTS API =================
 */
export const adminComplaintsAPI = {
  getAll: async (params) => {
    const res = await adminApi.get("/complaints", { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await adminApi.get(`/complaints/${id}`);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await adminApi.put(`/complaints/${id}/status`, { status });
    return res.data;
  },

  assignToVolunteer: async (id, volunteerId) => {
    const res = await adminApi.put(`/complaints/${id}/assign`, {
      volunteerId,
    });
    return res.data;
  },
};

/**
 * ================= VOLUNTEER COMPLAINTS API =================
 * 🔥 THIS EXPORT WAS MISSING (CAUSE OF ALL ERRORS)
 */
export const volunteerComplaintsAPI = {
  getAll: async () => {
    const res = await adminApi.get("/volunteer/complaints");
    return res.data;
  },

  getById: async (id) => {
    const res = await adminApi.get(`/volunteer/complaints/${id}`);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await adminApi.put(
      `/volunteer/complaints/${id}/status`,
      { status }
    );
    return res.data;
  },

  getDashboardStats: async () => {
    const res = await adminApi.get(
      "/volunteer/complaints/stats/dashboard"
    );
    return res.data;
  },
};

/**
 * ================= ADMIN VOLUNTEERS API =================
 */
export const adminVolunteersAPI = {
  getAll: async () => {
    const res = await adminApi.get("/volunteers");
    return res.data;
  },

  approve: async (id) => {
    const res = await adminApi.put(`/volunteers/${id}/approve`);
    return res.data;
  },

  block: async (id) => {
    const res = await adminApi.put(`/volunteers/${id}/block`);
    return res.data;
  },

  delete: async (id) => {
    const res = await adminApi.delete(`/volunteers/${id}`);
    return res.data;
  },
};

/**
 * ================= ADMIN USERS API =================
 */
export const adminUsersAPI = {
  getAll: async () => {
    const res = await adminApi.get("/users");
    return res.data;
  },

  block: async (id) => {
    const res = await adminApi.put(`/users/${id}/block`);
    return res.data;
  },

  delete: async (id) => {
    const res = await adminApi.delete(`/users/${id}`);
    return res.data;
  },
};

export default adminApi;
