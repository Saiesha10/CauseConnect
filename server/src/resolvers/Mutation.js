import { PrismaClient } from "../../generated/prisma/index.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export const Mutation = {
 
  async signUpUser(_, { email, full_name, password, profile_picture, role, phone, description }) {
    const existingUser = await prisma.User.findUnique({ where: { email } });
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.User.create({
      data: { email, full_name, password: hashedPassword, profile_picture, role: role || "user", phone, description },
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { user: newUser, token };
  },

  async loginUser(_, { email, password }) {
    const user = await prisma.User.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { user, token };
  },

  async createNGO(_, args, { user }) {
    if (!user) throw new Error("Not authenticated");
    if (user.role !== "organizer") throw new Error("Only organizers can create NGOs");

    return prisma.NGO.create({ data: { ...args, created_by: user.userId } });
  },

  async updateNGO(_, args, { user }) {
    if (!user) throw new Error("Not authenticated");

    const existingNGO = await prisma.NGO.findUnique({ where: { id: args.id } });
    if (!existingNGO) throw new Error("NGO not found");
    if (existingNGO.created_by !== user.userId) throw new Error("Not authorized");

    return prisma.NGO.update({
      where: { id: args.id },
      data: {
        name: args.name ?? undefined,
        cause: args.cause ?? undefined,
        description: args.description ?? undefined,
        location: args.location ?? undefined,
        contact_info: args.contact_info ?? undefined,
        donation_link: args.donation_link ?? undefined,
        ngo_picture: args.ngo_picture ?? undefined,
      },
    });
  },

  async deleteNGO(_, { id }, { user }) {
    if (!user) throw new Error("Not authenticated");

    const ngo = await prisma.NGO.findUnique({ where: { id } });
    if (!ngo) throw new Error("NGO not found");
    if (ngo.created_by !== user.userId || user.role !== "organizer") throw new Error("Not authorized");

    await prisma.Donation.deleteMany({ where: { ngo_id: id } });
    await prisma.Event.deleteMany({ where: { ngo_id: id } });
    await prisma.Favorite.deleteMany({ where: { ngo_id: id } });

    return prisma.NGO.delete({ where: { id } });
  },


  async updateUser(_, { id, ...rest }, { user }) {
    if (!user || user.userId !== id) throw new Error("Not authorized");
    return prisma.User.update({ where: { id }, data: { ...rest } });
  },

  async deleteUser(_, { id }, { user }) {
    if (!user || user.userId !== id) throw new Error("Not authorized");

    await prisma.Donation.deleteMany({ where: { user_id: id } });
    await prisma.Favorite.deleteMany({ where: { user_id: id } });
    await prisma.EventVolunteer.deleteMany({ where: { user_id: id } });
    await prisma.Notification.deleteMany({ where: { user_id: id } });
    await prisma.NGO.deleteMany({ where: { created_by: id } });

    return prisma.User.delete({ where: { id } });
  },


  async createEvent(_, args, { user }) {
  if (!user) throw new Error("Not authenticated");
  if (user.role !== "organizer") throw new Error("not authorized");

  
  const { ngo_id, title, description, event_date, location, volunteers_needed } = args;

  return prisma.Event.create({
    data: {
      ngo_id,
      title,
      description,
      event_date: event_date ? new Date(event_date) : null,
      location,
      volunteers_needed: volunteers_needed || null,
    },
    include: { ngo: true, volunteers: true },
  });
},
async updateEvent(_, args, { user }) {
  if (!user) throw new Error("Not authenticated");
  if (user.role !== "organizer") throw new Error("Only organizers can update events");

  const { id, title, description, event_date, location, volunteers_needed } = args;


  const existingEvent = await prisma.Event.findUnique({ where: { id } });
  if (!existingEvent) throw new Error("Event not found");

  
  return prisma.Event.update({
    where: { id },
    data: {
      title: title !== undefined ? title : existingEvent.title,
      description: description !== undefined ? description : existingEvent.description,
      event_date: event_date !== undefined ? new Date(event_date) : existingEvent.event_date,
      location: location !== undefined ? location : existingEvent.location,
      volunteers_needed: volunteers_needed !== undefined ? volunteers_needed : existingEvent.volunteers_needed,
    },
    include: { ngo: true, volunteers: true },
  });
},

  async deleteEvent(_, { id }, { user }) {
    if (!user) throw new Error("Not authenticated");

    const event = await prisma.Event.findUnique({ where: { id } });
    if (!event) throw new Error("Event not found");

    await prisma.EventVolunteer.deleteMany({ where: { event_id: id } });
    return prisma.Event.delete({ where: { id } });
  },

  async donateToNGO(_, { ngo_id, amount, message }, { user }) {
    if (!user) throw new Error("Not authenticated");

    return prisma.Donation.create({
      data: { ngo_id, user_id: user.userId, amount,message },
      include: { user: true, ngo: true },
    });
  },

  addFavorite: async (_, { ngo_id }, { user, prisma }) => {
  if (!user || !user.userId) throw new Error("Not authenticated");

  const ngoExists = await prisma.NGO.findUnique({ where: { id: ngo_id } });
  if (!ngoExists) throw new Error("NGO not found");

  const existing = await prisma.favorite.findFirst({
    where: { ngo_id, user_id: user.userId },
  });

  if (existing) throw new Error("NGO already added to favorites");

  const favorite = await prisma.favorite.create({
    data: {
      ngo_id,
      user_id: user.userId,
    },
    include: {
      ngo: true,
      user: true,
    },
  });

  return favorite;
},

removeFavorite: async (_, { ngo_id }, { user, prisma }) => {
  if (!user) throw new Error("Not authenticated");

  const favorite = await prisma.favorite.findFirst({
    where: { user_id: user.userId, ngo_id },
  });

  if (!favorite) {
    
    return "Favorite already removed or not found";
  }

  await prisma.favorite.delete({
    where: { id: favorite.id },
  });

  return "Removed from favorites";
},




registerVolunteer: async (_, { event_id }, { prisma, user, req }) => {

  let currentUser = user;

  if (!currentUser) {
    const authHeader = req.headers.authorization || "";
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        currentUser = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        throw new Error("Unauthorized: Invalid token");
      }
    }
  }

  if (!currentUser) {
    throw new Error("Unauthorized: You must be logged in to register for an event.");
  }

  const user_id = currentUser.userId; 

  const alreadyRegistered = await prisma.EventVolunteer.findFirst({
    where: { event_id, user_id },
  });

  if (alreadyRegistered) {
    throw new Error("You have already registered for this event.");
  }

 
  const registration = await prisma.EventVolunteer.create({
    data: {
      event_id,
      user_id,
      registered_at: new Date(),
    },
    include: { user: true, event: true },
  });

  return registration;
},

  async removeVolunteer(_, { event_id, user_id }, { user }) {
    if (!user) throw new Error("Not authenticated");

    await prisma.EventVolunteer.deleteMany({ where: { event_id, user_id } });
    return "Volunteer removed";
  },

  async createNotification(_, { message, cause_id }, { user }) {
    if (!user) throw new Error("Not authenticated");

    return prisma.Notification.create({
      data: { message, cause_id, user_id: user.userId },
    });
  },
};
