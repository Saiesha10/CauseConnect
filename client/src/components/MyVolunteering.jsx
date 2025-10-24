import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Avatar,
  Button,
  CircularProgress,
} from "@mui/material";


const GET_USER_VOLUNTEERING = gql`
  query getUserVolunteering($userId: ID!) {
    userVolunteers(userId: $userId) {
      id
      registered_at
      event {
        id
        title
        description
        event_date
        location
        ngo {
          id
          name
          ngo_picture
        }
      }
      user {
        id
        full_name
        profile_picture
      }
    }
  }
`;


const REMOVE_VOLUNTEER = gql`
  mutation removeVolunteer($eventId: ID!, $userId: ID!) {
    removeVolunteer(event_id: $eventId, user_id: $userId)
  }
`;

const MyVolunteering = ({ userId }) => {
  const { data, loading, refetch } = useQuery(GET_USER_VOLUNTEERING, {
    variables: { userId },
    fetchPolicy: "network-only",
  });

  const [removeVolunteer] = useMutation(REMOVE_VOLUNTEER);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  const handleUnregister = async (eventId) => {
    try {
      await removeVolunteer({ variables: { eventId, userId } });
      refetch(); 
    } catch (err) {
      console.error(err);
      alert("Failed to unregister. Please try again.");
    }
  };

  const parseDate = (timestamp) => {
    if (!timestamp) return "TBD";
    const d = new Date(Number(timestamp));
    return isNaN(d.getTime()) ? "TBD" : d.toLocaleDateString();
  };

  if (!data?.userVolunteers?.length)
    return (
      <Typography sx={{ mt: 4, textAlign: "center", color: "gray" }}>
        You are not registered for any events yet.
      </Typography>
    );

  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: 600, color: "#E76F51" }}
      >
        My Volunteering Events
      </Typography>

      <Grid container spacing={2}>
        {data.userVolunteers.map((vol) => (
          <Grid item xs={12} sm={6} md={4} key={vol.id}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Avatar
                  src={vol.event.ngo.ngo_picture || ""}
                  alt={vol.event.ngo.name}
                  sx={{ width: 50, height: 50, mr: 2 }}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {vol.event.title}
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                NGO: <strong>{vol.event.ngo.name}</strong>
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Event Date: {parseDate(vol.event.event_date)}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Registered on: {parseDate(vol.registered_at)}
              </Typography>

              <Button
                variant="outlined"
                color="error"
                onClick={() => handleUnregister(vol.event.id)}
                sx={{ mt: 2 }}
              >
                Unregister
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyVolunteering;
