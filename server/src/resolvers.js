export const resolvers = {
  Query: {
    users: async (_, __, { prisma }) => {
      return prisma.users.findMany();
    },
    ngos: async (_, __, { prisma }) => {
      return prisma.ngos.findMany();
    },
  },
};
