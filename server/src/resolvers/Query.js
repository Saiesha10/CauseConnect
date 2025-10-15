import { PrismaClient } from "../../generated/prisma/index.js";

const prisma = new PrismaClient();

export const Query = {
  // ========================
  // NGOs
  // ========================
  ngos: async (_, __, { user }) => {
    try {
      if (!user) throw new Error("Not authenticated");
      return prisma.ngos.findMany({
        orderBy: { created_at: "desc" },
      });
    } catch (err) {
      throw new Error(err.message);
    }
  },

  ngo: async (_, { id }, { user }) => {
    try {
      if (!user) throw new Error("Not authenticated");
      const ngo = await prisma.ngos.findUnique({
        where: { id },
        include: { events: true, donations: true, favorites: true },
      });
      if (!ngo) throw new Error("NGO not found");
      return ngo;
    } catch (err) {
      throw new Error(err.message);
    }
  },

  // ========================
  // EVENTS
  // ========================
  events: async (_, __, { user }) => {
    try {
      if (!user) throw new Error("Not authenticated");
      return prisma.events.findMany({
        orderBy: { created_at: "desc" },
      });
    } catch (err) {
      throw new Error(err.message);
    }
  },

  // ========================
  // USER DATA
  // ========================
  userDonations: async (_, __, { user }) => {
    try {
      if (!user) throw new Error("Not authenticated");
      return prisma.donations.findMany({
        where: { user_id: user.userId },
        include: { ngos: true },
      });
    } catch (err) {
      throw new Error(err.message);
    }
  },

  userFavorites: async (_, __, { user }) => {
    try {
      if (!user) throw new Error("Not authenticated");
      return prisma.favorites.findMany({
        where: { user_id: user.userId },
        include: { ngos: true },
      });
    } catch (err) {
      throw new Error(err.message);
    }
  },

  userNotifications: async (_, __, { user }) => {
    try {
      if (!user) throw new Error("Not authenticated");
      return prisma.notifications.findMany({
        where: { user_id: user.userId },
        include: { causes: true },
      });
    } catch (err) {
      throw new Error(err.message);
    }
  },

  // ========================
  // ADMIN / ORGANIZER ONLY
  // ========================
  users: async (_, __, { user }) => {
    try {
      if (!user) throw new Error("Not authenticated");
      if (user.role !== "organizer") throw new Error("Not authorized");
      return prisma.users.findMany();
    } catch (err) {
      throw new Error(err.message);
    }
  },
};
