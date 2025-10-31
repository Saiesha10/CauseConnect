import { PrismaClient } from "../../generated/prisma/index.js";

const prisma = new PrismaClient();

export const Query = {
  ngos: async (_, __, { user }) => {
    if (!user || !user.userId) throw new Error("Not authenticated");

    return prisma.NGO.findMany({
      orderBy: { created_at: "desc" },
    });
  },

  ngo: async (_, { id }, { user }) => {
    if (!user || !user.userId) throw new Error("Not authenticated");

    const ngo = await prisma.NGO.findUnique({
      where: { id },
      include: {
        events: true,
        donations: true,
        favorites: true,
      
        creator: true,

      },
    });

    if (!ngo) throw new Error("NGO not found");
    return ngo;
  },

  events: async (_, { organizerId }, { user }) => {
    if (!user || !user.userId) throw new Error("Not authenticated");

    const where = organizerId
      ? { ngo: { created_by: organizerId } } 
      : {};

    return prisma.Event.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: { ngo: true, volunteers: true },
    });
  },

  
  userDonations: async (_, __, { prisma, user }) => {
    if (!user || !user.userId) {
      throw new Error("Not authenticated");
    }

    const donations = await prisma.donation.findMany({
      where: { user_id: user.userId },
      include: { ngo: true },
    });

    return donations || [];
  },

  userFavorites: async (_, __, { user }) => {
    if (!user || !user.userId) throw new Error("Not authenticated");

    return prisma.Favorite.findMany({
      where: { user_id: user.userId },
      include: { ngo: true },
    });
  },
  userNotifications: async (_, __, { user }) => {
    if (!user || !user.userId) throw new Error("Not authenticated");

    return prisma.Notification.findMany({
      where: { user_id: user.userId },
      include: { cause: true },
    });
  },
  users: async (_, __, { user }) => {
    if (!user || !user.userId) throw new Error("Not authenticated");
    if (user.role !== "organizer") throw new Error("Not authorized");

    return prisma.User.findMany();
  },
  user: async (_, { id }, { user: authUser }) => {
    if (!authUser || !authUser.userId) throw new Error("Not authenticated");

    if (authUser.userId !== id && authUser.role !== "organizer")
      throw new Error("Not authorized");

    const foundUser = await prisma.User.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        profile_picture: true,
        created_at: true,
      },
    });

    if (!foundUser) throw new Error("User not found");
    return foundUser;
  },

  userVolunteers: async (_, { userId }, { user: authUser }) => {
    if (!authUser || !authUser.userId) throw new Error("Not authenticated");

    if (authUser.userId !== userId && authUser.role !== "organizer") {
      throw new Error("Not authorized");
    }

    return prisma.EventVolunteer.findMany({
      where: { user_id: userId },
      include: {
        event: { include: { ngo: true } },
        user: true,
      },
      orderBy: { registered_at: "desc" },
    });
  },

  organizerNGOs: async (_, __, { user }) => {
    if (!user || !user.userId) throw new Error("Not authenticated");
    if (user.role !== "organizer") throw new Error("Not authorized");

    return prisma.NGO.findMany({
      where: { created_by: user.userId }, 
      include: { donations: true, events: true, favorites: true },
      orderBy: { created_at: "desc" },
    });
  },

  organizerEvents: async (_, __, { user }) => {
    if (!user || !user.userId) throw new Error("Not authenticated");
    if (user.role !== "organizer") throw new Error("Not authorized");

    return prisma.Event.findMany({
      where: { ngo: { created_by: user.userId } },
      include: { volunteers: true },
      orderBy: { created_at: "desc" },
    });
  },

  organizerDonations: async (_, __, { prisma, user }) => {
    if (!user || !user.userId) {
      throw new Error("Not authenticated");
    }

    if (user.role.toLowerCase() !== "organizer") {
      throw new Error("Not authorized");
    }

    const donations = await prisma.donation.findMany({
      where: { ngo: { created_by: user.userId } }, 
      include: { ngo: true, user: true },
    });

    return donations || [];
  },

  organizerVolunteers: async (_, __, { user }) => {
    if (!user || !user.userId) throw new Error("Not authenticated");
    if (user.role !== "organizer") throw new Error("Not authorized");

    return prisma.EventVolunteer.findMany({
      where: { event: { ngo: { created_by: user.userId } } },
      include: { event: true, user: true },
      orderBy: { registered_at: "desc" },
    });
  },

  organizerFavorites: async (_, __, { user }) => {
    if (!user || !user.userId) throw new Error("Not authenticated");
    if (user.role !== "organizer")
      throw new Error("Only organizers can access this");

    return prisma.Favorite.findMany({
      where: { ngo: { created_by: user.userId } }, 
      include: { ngo: true, user: true },
    });
  },
};
