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
    if (!user) throw new Error("User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Incorrect password");

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
  if (user.role !== "organizer") throw new Error("Only organizers can create events");

  
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
  async deleteEvent(_, { id }, { user }) {
    if (!user) throw new Error("Not authenticated");

    const event = await prisma.Event.findUnique({ where: { id } });
    if (!event) throw new Error("Event not found");

    await prisma.EventVolunteer.deleteMany({ where: { event_id: id } });
    return prisma.Event.delete({ where: { id } });
  },

  async donateToNGO(_, { ngo_id, amount }, { user }) {
    if (!user) throw new Error("Not authenticated");

    return prisma.Donation.create({
      data: { ngo_id, user_id: user.userId, amount },
      include: { user: true, ngo: true },
    });
  },

  async addFavorite(_, { ngo_id }, { user }) {
    if (!user) throw new Error("Not authenticated");

    return prisma.Favorite.create({ data: { ngo_id, user_id: user.userId } });
  },

  async removeFavorite(_, { ngo_id }, { user }) {
    if (!user) throw new Error("Not authenticated");

    await prisma.Favorite.deleteMany({ where: { ngo_id, user_id: user.userId } });
    return "Favorite removed";
  },

  async registerVolunteer(_, { eventId }, { user, prisma }) {
  if (!user) throw new Error("Not authenticated");

  if (user.role !== "user" && user.role !== "organizer") {
    throw new Error("Only registered users or organizers can volunteer");
  }


  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { volunteers: true },
  });

  if (!event) throw new Error("Event not found");


  const alreadyRegistered = event.volunteers.some(v => v.user_id === user.id);
  if (alreadyRegistered) throw new Error("Already registered for this event");

  if (event.volunteers_needed && event.volunteers.length >= event.volunteers_needed) {
    throw new Error("Volunteer slots are already filled");
  }

  await prisma.eventVolunteer.create({
    data: {
      event_id: eventId,
      user_id: user.id,
    },
  });


  return prisma.event.findUnique({
    where: { id: eventId },
    include: { volunteers: true },
  });
}


,
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
