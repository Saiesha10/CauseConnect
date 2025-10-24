import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Navigate, Routes, Route, useParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";

import Sidebar from "./Sidebar";
import ProfileSection from "../components/ProfileSection";
import DonationList from "../components/DonationList";
import EventList from "../components/EventList";
import NGOList from "../components/NGOList";
import VolunteerList from "../components/VolunteerList";
import FavoritesList from "../components/FavoritesList";
import CreateEvent from "../pages/CreateEvent";
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

const Dashboard = () => {
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

  if (role === "user") return <Navigate to="/user-dashboard" />; 
  if (role !== "organizer") return <Navigate to="/login" />; 

  return (
    <Box sx={{ display: "flex", bgcolor: "#fafafa", minHeight: "100vh" }}>
      <Sidebar role={role} />
      <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Routes>
       
          <Route path="profile" element={<ProfileSection userId={userId} />} />
          <Route path="donations" element={<DonationList organizer />} />
          <Route path="volunteering" element={<MyVolunteering organizer userId={userId} />} />
          <Route path="favorites" element={<FavoritesList userId={userId} />} />

      
          <Route path="ngos" element={<NGOList organizer userId={userId} />} />
          <Route path="events" element={<EventList organizer userId={userId} />} />
          <Route path="events/create/:ngoId" element={<CreateEventWrapper />} />
          <Route path="volunteers" element={<VolunteerList organizer userId={userId} />} />

        
          <Route path="*" element={<ProfileSection userId={userId} />} />
        </Routes>
      </Box>
    </Box>
  );
};

const CreateEventWrapper = () => {
  const { ngoId } = useParams();
  return <CreateEvent ngoId={ngoId} />;
};

export default Dashboard;
