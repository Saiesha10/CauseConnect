import React, { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Modal,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Container,
  Button,
  keyframes,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import DescriptionIcon from "@mui/icons-material/Description";
import EventIcon from "@mui/icons-material/Event";


const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const navButtonStyle = {
  bgcolor: "#E76F51",
  color: "#fff",
  fontWeight: 700,
  textTransform: "none",
  fontFamily: "'Work Sans', sans-serif",
  borderRadius: "12px",
  px: { xs: 2, sm: 2.5 },
  py: 1.2,
  transition: "all 0.3s ease",
  "&:hover": {
    bgcolor: "#D65A3C",
    transform: "scale(1.05)",
    boxShadow: "0 6px 20px rgba(231, 111, 81, 0.4)",
  },
  "&:disabled": {
    bgcolor: "#B0BEC5",
    color: "#fff",
  },
};


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

const parseDate = (timestamp) => {
  if (!timestamp) return "TBD";
  const d = new Date(Number(timestamp) || timestamp);
  return isNaN(d.getTime())
    ? "TBD"
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const VolunteerList = () => {
  const { data, loading, error, refetch } = useQuery(GET_ORGANIZER_VOLUNTEERS, {
    fetchPolicy: "cache-and-network",
  });

  const [selectedUser, setSelectedUser] = useState(null);

  const getStatus = (eventTimestamp) => {
    if (!eventTimestamp) return "Volunteering";
    const today = new Date();
    const event = new Date(Number(eventTimestamp) || eventTimestamp);
    return event < today ? "Completed" : "Volunteering";
  };

  const getStatusColor = (status) => (status === "Completed" ? "default" : "success");

  const handleCardClick = (user) => setSelectedUser(user);
  const handleClose = () => setSelectedUser(null);

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
          Failed to load volunteers. Please try again.
        </Alert>
        <Button
          variant="contained"
          sx={{ ...navButtonStyle, fontSize: { xs: "0.9rem", sm: "1rem" } }}
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
          Volunteers
        </Typography>

        {data?.organizerVolunteers?.length === 0 ? (
          <Typography
            sx={{
              fontFamily: "'Work Sans', sans-serif",
              color: "#585858",
              textAlign: "center",
              fontSize: { xs: "1rem", sm: "1.2rem" },
              animation: `${slideUp} 0.8s ease-out 0.4s backwards`,
            }}
          >
            No volunteers found.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {data.organizerVolunteers.map((vol, idx) => {
              const status = getStatus(vol.event.event_date);
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
                      cursor: "pointer",
                      animation: `${slideUp} 0.6s ease-out ${0.4 + idx * 0.2}s backwards`,
                    }}
                    onClick={() => handleCardClick(vol.user)}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontFamily: "'Work Sans', sans-serif",
                            fontWeight: 700,
                            color: "#E76F51",
                            fontSize: { xs: "1.2rem", sm: "1.4rem" },
                          }}
                        >
                          {vol.user.full_name || "Anonymous Volunteer"}
                        </Typography>
                        <Chip
                          label={status}
                          color={getStatusColor(status)}
                          size="small"
                          sx={{
                            fontFamily: "'Work Sans', sans-serif",
                            fontSize: { xs: "0.8rem", sm: "0.9rem" },
                          }}
                        />
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
                        <strong>Event:</strong> {vol.event.title}
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
                        <strong>Registered on:</strong> {parseDate(vol.registered_at)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        <Modal
          open={!!selectedUser}
          onClose={handleClose}
          sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Card
            sx={{
              p: 4,
              borderRadius: 3,
              width: { xs: "90%", sm: 450 },
              maxHeight: "80vh",
              overflowY: "auto",
              bgcolor: "#fff",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}
          >
            {selectedUser && (
              <Box>
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <Avatar
                    src={selectedUser.profile_picture || "/default-user.png"}
                    alt={selectedUser.full_name || "Anonymous Volunteer"}
                    sx={{
                      width: { xs: 80, sm: 100 },
                      height: { xs: 80, sm: 100 },
                      mx: "auto",
                      mb: 2,
                      border: "2px solid #E76F51",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Work Sans', sans-serif",
                      fontWeight: 700,
                      color: "#264653",
                      fontSize: { xs: "1.2rem", sm: "1.4rem" },
                    }}
                  >
                    {selectedUser.full_name || "Anonymous Volunteer"}
                  </Typography>
                  <Chip
                    label={selectedUser.role || "Volunteer"}
                    sx={{
                      bgcolor: "#FFE5D9",
                      color: "#E76F51",
                      fontFamily: "'Work Sans', sans-serif",
                      mt: 1,
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    }}
                  />
                </Box>

                <Divider sx={{ my: 2, bgcolor: "#FFE5D9" }} />

                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Work Sans', sans-serif",
                    color: "#585858",
                    fontSize: { xs: "0.85rem", sm: "0.9rem" },
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <EmailIcon sx={{ color: "#585858", fontSize: { xs: "1rem", sm: "1.2rem" } }} />
                  <strong>Email:</strong> {selectedUser.email || "N/A"}
                </Typography>
                {selectedUser.phone && (
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "'Work Sans', sans-serif",
                      color: "#585858",
                      fontSize: { xs: "0.85rem", sm: "0.9rem" },
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <PhoneIcon sx={{ color: "#585858", fontSize: { xs: "1rem", sm: "1.2rem" } }} />
                    <strong>Phone:</strong> {selectedUser.phone}
                  </Typography>
                )}
                {selectedUser.description && (
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "'Work Sans', sans-serif",
                      color: "#585858",
                      fontSize: { xs: "0.85rem", sm: "0.9rem" },
                      mb: 1,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                    }}
                  >
                    <DescriptionIcon sx={{ color: "#585858", fontSize: { xs: "1rem", sm: "1.2rem" } }} />
                    <Box>
                      <strong>Description:</strong> {selectedUser.description}
                    </Box>
                  </Typography>
                )}
                <Box sx={{ mt: 3, textAlign: "center" }}>
                  <Button
                    onClick={handleClose}
                    sx={{
                      color: "#E76F51",
                      fontFamily: "'Work Sans', sans-serif",
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      textTransform: "none",
                    }}
                  >
                    Close
                  </Button>
                </Box>
              </Box>
            )}
          </Card>
        </Modal>
      </Container>
    </Box>
  );
};

export default VolunteerList;