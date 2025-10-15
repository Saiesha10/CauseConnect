import { PrismaClient } from "../../generated/prisma/index.js";
import { validate as isUUID } from "uuid";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export const Mutation = {

  async signUpUser(_, { email, full_name, password, profile_picture, role }) {
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: { email, full_name, password: hashedPassword, profile_picture, role: role || "user" },
    });

    const token = jwt.sign({ userId: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return { user: newUser, token };
  },

  async loginUser(_, { email, password }) {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Incorrect password");

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return { user, token };
  },

  async createNGO(_, { name, cause, description, location, contact_info, donation_link, ngo_picture }, { user }) {
    if (!user) throw new Error("Not authenticated");
    if (user.role !== "organizer") throw new Error("Only organizers can create NGOs");

    return prisma.ngos.create({
      data: { name, cause, description, location, contact_info, donation_link, ngo_picture, created_by: user.userId },
    });
  },

  async deleteNGO(_, { id }, { user }) {
    if (!user) throw new Error("Not authenticated");
    const ngo = await prisma.ngos.findUnique({ where: { id } });
    if (!ngo) throw new Error("NGO not found");
    if (user.role !== "organizer" || ngo.created_by !== user.userId) throw new Error("Not authorized");

    await prisma.donations.deleteMany({ where: { ngo_id: id } });
    await prisma.events.deleteMany({ where: { ngo_id: id } });
    await prisma.favorites.deleteMany({ where: { ngo_id: id } });
    return prisma.ngos.delete({ where: { id } });
  },

  async createEvent(_, { ngo_id, title, description, event_date, location, volunteers_needed }, { user }) {
    if (!user) throw new Error("Not authenticated");
    const ngo = await prisma.ngos.findUnique({ where: { id: ngo_id } });
    if (!ngo) throw new Error("NGO not found");
    if (user.role !== "organizer" || ngo.created_by !== user.userId) throw new Error("Not authorized");

    return prisma.events.create({
      data: { ngo_id, title, description, event_date, location, volunteers_needed },
    });
  },

  async deleteEvent(_, { id }, { user }) {
    if (!user) throw new Error("Not authenticated");
    const event = await prisma.events.findUnique({ where: { id } });
    const ngo = await prisma.ngos.findUnique({ where: { id: event.ngo_id } });
    if (user.role !== "organizer" || ngo.created_by !== user.userId) throw new Error("Not authorized");

    await prisma.event_volunteers.deleteMany({ where: { event_id: id } });
    return prisma.events.delete({ where: { id } });
  },


  async registerVolunteer(_, { event_id }, { user }) {
    if (!user) throw new Error("Not authenticated");
    return prisma.event_volunteers.create({ data: { event_id, user_id: user.userId } });
  },

  async removeVolunteer(_, { event_id, user_id }, { user }) {
    if (!user) throw new Error("Not authenticated");
    // Only the organizer of the NGO can remove volunteers
    const event = await prisma.events.findUnique({ where: { id: event_id } });
    const ngo = await prisma.ngos.findUnique({ where: { id: event.ngo_id } });
    if (user.role !== "organizer" || ngo.created_by !== user.userId) throw new Error("Not authorized");

    await prisma.event_volunteers.deleteMany({ where: { event_id, user_id } });
    return "Volunteer removed successfully";
  },

  async donateToNGO(_, { ngo_id, amount }, { user }) {
    if (!user) throw new Error("Not authenticated");
    return prisma.donations.create({ data: { user_id: user.userId, ngo_id, amount } });
  },

  async addFavorite(_, { ngo_id }, { user }) {
    if (!user) throw new Error("Not authenticated");
    return prisma.favorites.create({ data: { user_id: user.userId, ngo_id } });
  },

  async removeFavorite(_, { ngo_id }, { user }) {
    if (!user) throw new Error("Not authenticated");
    await prisma.favorites.deleteMany({ where: { user_id: user.userId, ngo_id } });
    return "Favorite removed successfully";
  },

  async createNotification(_, { message, cause_id }, { user }) {
    if (!user) throw new Error("Not authenticated");
    return prisma.notifications.create({ data: { user_id: user.userId, message, cause_id } });
  },


  async updateUser(_, { id, full_name, profile_picture }, { user }) {
    if (!user || user.userId !== id) throw new Error("Not authorized");
    return prisma.users.update({ where: { id }, data: { full_name, profile_picture } });
  },

  async deleteUser(_, { id }, { user }) {
    if (!user || user.userId !== id) throw new Error("Not authorized");

    await prisma.donations.deleteMany({ where: { user_id: id } });
    await prisma.favorites.deleteMany({ where: { user_id: id } });
    await prisma.event_volunteers.deleteMany({ where: { user_id: id } });
    await prisma.notifications.deleteMany({ where: { user_id: id } });
    await prisma.ngos.deleteMany({ where: { created_by: id } });

    return prisma.users.delete({ where: { id } });
  },
};
