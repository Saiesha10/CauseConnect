import { PrismaClient } from "../../generated/prisma/index.js";

const prisma = new PrismaClient();

export const Query = {
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

  users: async (_, __, { user }) => {
    try {
      if (!user) throw new Error("Not authenticated");
      if (user.role !== "organizer") throw new Error("Not authorized");
      return prisma.users.findMany();
    } catch (err) {
      throw new Error(err.message);
    }
  },

  // ✅ New query: get current logged-in user info
  user: async (_, { id }, { user: authUser }) => {
    try {
      if (!authUser) throw new Error("Not authenticated");

      
      if (authUser.userId !== id && authUser.role !== "organizer") {
        throw new Error("Not authorized");
      }

      const foundUser = await prisma.users.findUnique({
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
    } catch (err) {
      throw new Error(err.message);
    }
  },
  // server/resolvers/Query.js (add these to your existing Query object)

// Get NGOs created by the organizer
organizerNGOs: async (_, __, { user }) => {
  try {
    if (!user) throw new Error("Not authenticated");
    if (user.role !== "organizer") throw new Error("Not authorized");

    return prisma.ngos.findMany({
      where: { created_by: user.userId },
      include: { donations: true, events: true, favorites: true },
      orderBy: { created_at: "desc" },
    });
  } catch (err) {
    throw new Error(err.message);
  }
},

// Get events for organizer’s NGOs
organizerEvents: async (_, __, { user }) => {
  try {
    if (!user) throw new Error("Not authenticated");
    if (user.role !== "organizer") throw new Error("Not authorized");

    return prisma.events.findMany({
      where: { ngo: { created_by: user.userId } },
      include: { volunteers: true },
      orderBy: { created_at: "desc" },
    });
  } catch (err) {
    throw new Error(err.message);
  }
},

// Get donations to organizer’s NGOs
organizerDonations: async (_, __, { user }) => {
  try {
    if (!user) throw new Error("Not authenticated");
    if (user.role !== "organizer") throw new Error("Not authorized");

    return prisma.donations.findMany({
      where: { ngos: { created_by: user.userId } },
      include: { ngos: true, user: true },
      orderBy: { created_at: "desc" },
    });
  } catch (err) {
    throw new Error(err.message);
  }
},

// Get volunteers for organizer’s events
organizerVolunteers: async (_, __, { user }) => {
  try {
    if (!user) throw new Error("Not authenticated");
    if (user.role !== "organizer") throw new Error("Not authorized");

    return prisma.eventVolunteers.findMany({
      where: { event: { ngo: { created_by: user.userId } } },
      include: { event: true, user: true },
      orderBy: { registered_at: "desc" },
    });
  } catch (err) {
    throw new Error(err.message);
  }
},

};
