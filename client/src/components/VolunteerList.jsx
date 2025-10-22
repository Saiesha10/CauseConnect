import React, { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { Box, Typography, Grid, Paper, Chip, Modal, Avatar, Divider } from "@mui/material";

const GET_ORGANIZER_VOLUNTEERS = gql`
  query organizerVolunteers {
    organizerVolunteers {
      id
      user {
        id
        full_name
        email
        phone
        profile_picture
        role
        description
      }
      event {
        id
        title
        event_date
      }
      registered_at
    }
  }
`;

const VolunteerList = () => {
  const { data, loading } = useQuery(GET_ORGANIZER_VOLUNTEERS);
  const [selectedUser, setSelectedUser] = useState(null);

  if (loading) return <Typography>Loading volunteers...</Typography>;

  const parseDate = (timestamp) => {
    if (!timestamp) return "TBD";
    const d = new Date(Number(timestamp));
    return isNaN(d.getTime()) ? "TBD" : d.toLocaleDateString();
  };

  const getStatus = (eventTimestamp) => {
    if (!eventTimestamp) return "Volunteering";
    const today = new Date();
    const event = new Date(Number(eventTimestamp));
    return event < today ? "Completed" : "Volunteering";
  };

  const getStatusColor = (status) => (status === "Completed" ? "error" : "success");

  const handleCardClick = (user) => setSelectedUser(user);
  const handleClose = () => setSelectedUser(null);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "#E76F51" }}>
        Volunteers
      </Typography>

      <Grid container spacing={2}>
        {data.organizerVolunteers.map((vol) => {
          const status = getStatus(vol.event.event_date);
          return (
            <Grid item xs={12} sm={6} md={4} key={vol.id}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#fff",
                  cursor: "pointer",
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.03)", boxShadow: 6 },
                }}
                onClick={() => handleCardClick(vol.user)}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {vol.user.full_name}
                  </Typography>
                  <Chip label={status} color={getStatusColor(status)} size="small" />
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  For Event: <strong>{vol.event.title}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Event Date: {parseDate(vol.event.event_date)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Registered on: {parseDate(vol.registered_at)}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

    
      <Modal
        open={!!selectedUser}
        onClose={handleClose}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Paper sx={{ p: 4, borderRadius: 3, width: 450, maxHeight: "80vh", overflowY: "auto" }}>
          {selectedUser && (
            <Box>
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Avatar
                  src={selectedUser.profile_picture || ""}
                  alt={selectedUser.full_name}
                  sx={{ width: 100, height: 100, mx: "auto", mb: 2 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {selectedUser.full_name}
                </Typography>
                <Chip
                  label={selectedUser.role}
                  color="primary"
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Email:</strong> {selectedUser.email}
              </Typography>
              {selectedUser.phone && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Phone:</strong> {selectedUser.phone}
                </Typography>
              )}
              {selectedUser.description && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Description:</strong> {selectedUser.description}
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      </Modal>
    </Box>
  );
};

export default VolunteerList;
