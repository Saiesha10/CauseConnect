import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";

import Sidebar from "../Dashboard/Sidebar";
import ProfileSection from "../components/ProfileSection";
import DonationList from "../components/DonationList";
import FavoritesList from "../components/FavoritesList";
import MyVolunteering from "../components/MyVolunteering"; 

const GET_USER_BY_ID = gql`
  query getUser($id: ID!) {
    user(id: $id) {
      id
      full_name
      email
      role
      profile_picture
    }
  }
`;

const UserDashboard = () => {
  const token = localStorage.getItem("cc_token");
  if (!token) return <Navigate to="/login" />;

  let userId = null;
  try {
    userId = JSON.parse(atob(token.split(".")[1])).userId;
  } catch (e) {
    console.error("Invalid token", e);
    return <Navigate to="/login" />;
  }

  const { data, loading, error } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !userId,
    fetchPolicy: "cache-and-network",
  });

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography variant="h6" color="error">
          Error fetching user data
        </Typography>
      </Box>
    );

  const role = data?.user?.role;

  if (role === "organizer") return <Navigate to="/dashboard" />; 
  if (role !== "user") return <Navigate to="/login" />; 

  return (
    <Box sx={{ display: "flex", bgcolor: "#f9f9f9", minHeight: "100vh" }}>
      <Sidebar role={role} />
      <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Routes>
       
          <Route path="profile" element={<ProfileSection userId={userId} />} />
          <Route path="donations" element={<DonationList user />} />
          <Route path="volunteering" element={<MyVolunteering user userId={userId} />} />
          <Route path="favorites" element={<FavoritesList user userId={userId} />} />

         
          <Route path="*" element={<ProfileSection userId={userId} />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default UserDashboard;
