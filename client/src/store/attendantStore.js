import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAttendantStore = create(
  persist(
    (set) => ({
      activeAttendant: null, // { id, name, emoji, color }
      setActiveAttendant: (attendant) => set({ activeAttendant: attendant }),
      clearActiveAttendant: () => set({ activeAttendant: null }),
    }),
    { name: "attendant-store" },
  ),
);

export default useAttendantStore;
