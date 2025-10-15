import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Query {
    ngos: [NGO]
    ngo(id: String!): NGO
    events: [Event]
    userDonations(user_id: String!): [Donation]
    users: [User]
  }

  type Mutation {
    signup(
      email: String!
      full_name: String
      profile_picture: String
      role: String
    ): User

    createNGO(
      name: String!
      cause: String
      description: String
      location: String
      contact_info: String
      donation_link: String
      ngo_picture: String
      created_by: String!
    ): NGO

    createEvent(
      ngo_id: String!
      title: String!
      description: String
      event_date: String
      location: String
      volunteers_needed: Int
    ): Event

    donateToNGO(user_id: String!, ngo_id: String!, amount: Float!): Donation

    addFavorite(user_id: String!, ngo_id: String!): Favorite

    registerVolunteer(event_id: String!, user_id: String!): EventVolunteer
  }

  type User {
    id: ID!
    email: String!
    full_name: String
    role: String
    profile_picture: String
    created_at: String
  }

  type NGO {
    id: ID!
    name: String!
    cause: String
    description: String
    location: String
    contact_info: String
    donation_link: String
    ngo_picture: String
    created_at: String
  }

  type Event {
    id: ID!
    ngo_id: String!
    title: String!
    description: String
    event_date: String
    location: String
    volunteers_needed: Int
    created_at: String
  }

  type Donation {
    id: ID!
    user_id: String!
    ngo_id: String!
    amount: Float!
    created_at: String
  }

  type Favorite {
    id: ID!
    user_id: String!
    ngo_id: String!
    created_at: String
  }

  type EventVolunteer {
    id: ID!
    event_id: String!
    user_id: String!
    registered_at: String
  }
`;
