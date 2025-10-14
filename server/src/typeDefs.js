import {gql} from "apollo-server-express";
export const typeDefs=gql`
type User{
id:ID!
email:String!
full_name:String
role:String
}
type NGO{
id:ID!
name:String!
cause:String
description:String
}
type Query{
users:[User!]!
ngos:[NGO!]
}
`;