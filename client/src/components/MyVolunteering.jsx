import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  Container,
  Divider,
  Snackbar,
  keyframes,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const navButtonStyle = {
  bgcolor: "#C62828",
  color: "#fff",
  fontWeight: 700,
  textTransform: "none",
  fontFamily: "'Work Sans', sans-serif",
  borderRadius: "12px",
  px: { xs: 2, sm: 2.5 },
  py: 1.2,
  transition: "all 0.3s ease",
  "&:hover": {
    bgcolor: "#B71C1C",
    transform: "scale(1.05)",
    boxShadow: "0 6px 20px rgba(198, 40, 40, 0.4)",
  },
  "&:disabled": {
    bgcolor: "#B0BEC5",
    color: "#fff",
  },
};

// GraphQL queries and mutations
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

const parseDate = (timestamp) => {
  if (!timestamp) return "TBD";
  const d = new Date(Number(timestamp) || timestamp);
  return isNaN(d.getTime())
    ? "TBD"
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const MyVolunteering = ({ userId }) => {
  const { data, loading, error, refetch } = useQuery(GET_USER_VOLUNTEERING, {
    variables: { userId },
    fetchPolicy: "network-only",
  });

  const [removeVolunteer, { loading: removing }] = useMutation(REMOVE_VOLUNTEER, {
    onCompleted: () => {
      setSnackbar({ open: true, message: "Successfully unregistered from the event!", severity: "success" });
      refetch();
    },
    onError: (err) => setSnackbar({ open: true, message: err.message, severity: "error" }),
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleUnregister = async (eventId) => {
    await removeVolunteer({ variables: { eventId, userId } });
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "linear-gradient(135deg, #FDFCFB 0%, #F5F5F5 100%)" }}>
        <CircularProgress sx={{ color: "#E76F51" }} />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", bgcolor: "linear-gradient(135deg, #FDFCFB 0%, #F5F5F5 100%)", pt: 6 }}>
        <Alert severity="error" sx={{ fontFamily: "'Work Sans', sans-serif", fontSize: { xs: "0.9rem", sm: "1rem" }, mb: 2 }}>
          Failed to load volunteering events. Please try again.
        </Alert>
        <Button
          variant="contained"
          sx={{ ...navButtonStyle, bgcolor: "#E76F51", "&:hover": { bgcolor: "#D65A3C" }, fontSize: { xs: "0.9rem", sm: "1rem" } }}
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </Box>
    );

  return (
    <Box
      sx={{
        bgcolor: "linear-gradient(135deg, #FDFCFB 0%, #F5F5F5 100%)",
        minHeight: "100vh",
        pt: { xs: 10, sm: 12 },
        pb: 6,
        animation: `${fadeIn} 1s ease-out`,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Work Sans', sans-serif",
            fontWeight: 700,
            color: "#E76F51",
            textAlign: "center",
            mb: 4,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            animation: `${slideUp} 0.8s ease-out 0.2s backwards`,
          }}
        >
          My Volunteering Events
        </Typography>

        {data?.userVolunteers?.length === 0 ? (
          <Typography
            sx={{
              fontFamily: "'Work Sans', sans-serif",
              color: "#585858",
              textAlign: "center",
              fontSize: { xs: "1rem", sm: "1.2rem" },
              animation: `${slideUp} 0.8s ease-out 0.4s backwards`,
            }}
          >
            You are not registered for any events yet.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {data.userVolunteers.map((vol, idx) => {
              const status = new Date(vol.event.event_date) > new Date() ? "Upcoming" : "Completed";
              return (
                <Grid item xs={12} sm={6} md={4} key={vol.id}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      height: "100%",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 12px 32px rgba(231, 111, 81, 0.3)",
                      },
                      bgcolor: "#FFF3EF",
                      animation: `${slideUp} 0.6s ease-out ${0.4 + idx * 0.2}s backwards`,
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Avatar
                          src={vol.event.ngo.ngo_picture || "/default-ngo.png"}
                          alt={vol.event.ngo.name}
                          sx={{
                            width: { xs: 40, sm: 48 },
                            height: { xs: 40, sm: 48 },
                            bgcolor: "#FFE5D9",
                            border: "2px solid #E76F51",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            mr: 2,
                          }}
                        />
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontFamily: "'Work Sans', sans-serif",
                              fontWeight: 700,
                              color: "#E76F51",
                              fontSize: { xs: "1.2rem", sm: "1.4rem" },
                            }}
                          >
                            {vol.event.title}
                          </Typography>
                          <Chip
                            label={status}
                            color={status === "Upcoming" ? "success" : "default"}
                            size="small"
                            sx={{
                              fontFamily: "'Work Sans', sans-serif",
                              mt: 0.5,
                              fontSize: { xs: "0.8rem", sm: "0.9rem" },
                            }}
                          />
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1, bgcolor: "#FFE5D9" }} />

                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          color: "#585858",
                          fontSize: { xs: "0.85rem", sm: "0.9rem" },
                          mb: 1,
                        }}
                      >
                        <strong>NGO:</strong> {vol.event.ngo.name}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          color: "#585858",
                          fontSize: { xs: "0.85rem", sm: "0.9rem" },
                          mb: 1,
                        }}
                      >
                        <strong>Description:</strong>{" "}
                        {vol.event.description
                          ? `${vol.event.description.substring(0, 100)}${vol.event.description.length > 100 ? "..." : ""}`
                          : "No description available."}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          color: "#585858",
                          fontSize: { xs: "0.85rem", sm: "0.9rem" },
                          mb: 1,
                        }}
                      >
                        <strong>Event Date:</strong> {parseDate(vol.event.event_date)}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          color: "#585858",
                          fontSize: { xs: "0.85rem", sm: "0.9rem" },
                          mb: 1,
                        }}
                      >
                        <strong>Location:</strong> {vol.event.location || "TBD"}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          color: "#585858",
                          fontSize: { xs: "0.85rem", sm: "0.9rem" },
                          mb: 2,
                        }}
                      >
                        <strong>Registered on:</strong> {parseDate(vol.registered_at)}
                      </Typography>

                      <Button
                        variant="contained"
                        sx={{
                          ...navButtonStyle,
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                        }}
                        onClick={() => handleUnregister(vol.event.id)}
                        disabled={removing}
                        startIcon={<VolunteerActivismIcon />}
                      >
                        {removing ? <CircularProgress size={24} color="inherit" /> : "Unregister"}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={handleCloseSnackbar}
            sx={{
              borderRadius: "12px",
              bgcolor:
                snackbar.severity === "success"
                  ? "#E8F5E9"
                  : snackbar.severity === "error"
                  ? "#FFEBEE"
                  : "#FFF3E0",
              color: "#264653",
              fontFamily: "'Work Sans', sans-serif",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default MyVolunteering;