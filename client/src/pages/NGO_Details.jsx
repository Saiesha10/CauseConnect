import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Snackbar,
  Alert,
  TextField,
  keyframes,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import client from "../apolloClient";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
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
};


export const GET_NGO = gql`
  query getNGO($id: ID!) {
    ngo(id: $id) {
      id
      name
      cause
      description
      location
      contact_info
      donation_link
      ngo_picture     
      creator {        
        id
        full_name
        email
        profile_picture
      }
      events {
        id
        title
        description
        event_date
        location
        volunteers_needed
        volunteers {
          id
          user_id
          registered_at
        }
      }
    }
  }
`;

export const GET_USER_FAVORITES = gql`
  query getUserFavorites {
    userFavorites {
      id
      ngo_id
    }
  }
`;

export const GET_ORGANIZER_VOLUNTEERS = gql`
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

export const ADD_FAVORITE = gql`
  mutation addFavorite($ngo_id: ID!) {
    addFavorite(ngo_id: $ngo_id) {
      id
      ngo_id
      user_id
      created_at
    }
  }
`;

export const REMOVE_FAVORITE = gql`
  mutation removeFavorite($ngo_id: ID!) {
    removeFavorite(ngo_id: $ngo_id)
  }
`;

export const REGISTER_VOLUNTEER = gql`
  mutation registerVolunteer($event_id: ID!) {
    registerVolunteer(event_id: $event_id) {
      id
      user_id
      event_id
      registered_at
    }
  }
`;

export const DONATE_TO_NGO = gql`
  mutation donateToNGO($ngo_id: ID!, $amount: Float!, $message: String) {
    donateToNGO(ngo_id: $ngo_id, amount: $amount, message: $message) {
      id
      amount
      message
      created_at
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

const NGO_Details = () => {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [volunteerModalOpen, setVolunteerModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { loading, error, data, refetch } = useQuery(GET_NGO, {
    variables: { id },
    fetchPolicy: "cache-and-network",
    client,
  });

  const { data: favoritesData, refetch: refetchFavorites } = useQuery(GET_USER_FAVORITES, {
    fetchPolicy: "cache-and-network",
    client,
  });

  const { data: volunteerData, loading: volunteerLoading, error: volunteerError, refetch: refetchVolunteers } = useQuery(GET_ORGANIZER_VOLUNTEERS, {
    fetchPolicy: "cache-and-network",
    client,
  });

  const [addFavoriteMutation] = useMutation(ADD_FAVORITE, {
    client,
    onCompleted: () => refetchFavorites(),
  });
  const [removeFavoriteMutation] = useMutation(REMOVE_FAVORITE, {
    client,
    onCompleted: () => refetchFavorites(),
  });
  const [registerVolunteerMutation] = useMutation(REGISTER_VOLUNTEER, {
    client,
    onCompleted: () => {
      refetch();
      refetchVolunteers();
    },
  });
  const [donateToNGOMutation] = useMutation(DONATE_TO_NGO, {
    client,
    onCompleted: () => {
      refetch();
      refetchVolunteers();
    },
  });

  useEffect(() => {
    if (favoritesData?.userFavorites) {
      const isFav = favoritesData.userFavorites.some((fav) => fav.ngo_id === id);
      setIsFavorite(isFav);
    }
  }, [favoritesData, id]);

  const userId = localStorage.getItem("user_id");

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar({ ...snackbar, open: false });
  }, [snackbar]);

  const isRegistered = useCallback(
    (event) => {
      if (!event) return false;
      const volunteers = Array.isArray(event.volunteers) ? event.volunteers : [];
      return volunteers.some((v) => v.user_id === userId);
    },
    [userId]
  );

  const handleVolunteerClick = useCallback((event) => {
    if (!event) return;
    setSelectedEvent(event);
    setVolunteerModalOpen(true);
  }, []);

  const confirmVolunteer = useCallback(async () => {
    if (!selectedEvent) return;
    try {
      await registerVolunteerMutation({ variables: { event_id: selectedEvent.id } });
      setSnackbar({ open: true, message: "Successfully registered for the event!", severity: "success" });
    } catch (err) {
      const msg = err.message.includes("already registered")
        ? "You are already registered for this event."
        : err.message;
      setSnackbar({ open: true, message: msg, severity: "warning" });
    } finally {
      setVolunteerModalOpen(false);
    }
  }, [selectedEvent, registerVolunteerMutation]);

  const submitDonation = useCallback(async () => {
    if (!donationAmount || Number(donationAmount) <= 0) {
      setSnackbar({ open: true, message: "Please enter a valid donation amount.", severity: "error" });
      return;
    }
    try {
      await donateToNGOMutation({
        variables: { ngo_id: data.ngo.id, amount: parseFloat(donationAmount), message: donationMessage || "" },
      });
      setSnackbar({ open: true, message: `Thank you for donating ₹${donationAmount}!`, severity: "success" });
      setDonationAmount("");
      setDonationMessage("");
      setDonationModalOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Donation failed", severity: "error" });
    }
  }, [donationAmount, donationMessage, donateToNGOMutation, data?.ngo.id]);

  const handleFavoriteToggle = useCallback(async () => {
  try {
    if (isFavorite) {
     
      const res = await removeFavoriteMutation({ variables: { ngo_id: id } });

     
      const message =
        typeof res.data?.removeFavorite === "string"
          ? res.data.removeFavorite
          : res.data?.removeFavorite?.message || "Removed from favorites 💔";

      setIsFavorite(false);
      setSnackbar({
        open: true,
        message,
        severity: "info",
      });

     
      setTimeout(() => refetchFavorites(), 300);
    } else {
   
      const alreadyFav = favoritesData?.userFavorites?.some(
        (fav) => fav.ngo_id === id
      );
      if (alreadyFav) {
        setSnackbar({
          open: true,
          message: "Already in favorites ❤️",
          severity: "warning",
        });
        return;
      }

      await addFavoriteMutation({ variables: { ngo_id: id } });
      setIsFavorite(true);
      setSnackbar({
        open: true,
        message: "Added to favorites ❤️",
        severity: "success",
      });

      setTimeout(() => refetchFavorites(), 300);
    }
  } catch (err) {
    
    const safeMessage =
      err?.message?.includes("already") || err?.message?.includes("not found")
        ? err.message
        : "Action failed. Please try again.";

    setSnackbar({
      open: true,
      message: safeMessage,
      severity: "error",
    });
  }
}, [
  isFavorite,
  addFavoriteMutation,
  removeFavoriteMutation,
  favoritesData,
  id,
  refetchFavorites,
]);



  if (loading)
    return (
      <Typography
        sx={{
          textAlign: "center",
          mt: { xs: 8, sm: 10 },
          fontFamily: "'Work Sans', sans-serif",
          color: "#E76F51",
          fontSize: { xs: "1.2rem", sm: "1.5rem" },
          animation: `${fadeIn} 0.8s ease-out`,
        }}
        aria-live="polite"
      >
        Loading NGO details...
      </Typography>
    );
  if (error)
    return (
      <Typography
        sx={{
          textAlign: "center",
          mt: { xs: 8, sm: 10 },
          color: "#E76F51",
          fontFamily: "'Work Sans', sans-serif",
          fontSize: { xs: "1.2rem", sm: "1.5rem" },
          animation: `${fadeIn} 0.8s ease-out`,
        }}
        aria-live="assertive"
      >
        Error: {error.message}
      </Typography>
    );

  const ngo = data?.ngo;
  const events = Array.isArray(ngo?.events) ? ngo.events.filter((event) => event != null) : [];

  return (
    <Box
      sx={{
        bgcolor: "linear-gradient(135deg, #FDFCFB 0%, #F5F5F5 100%)",
        minHeight: "100vh",
        pt: { xs: 8, sm: 10 },
        pb: { xs: 4, sm: 6 },
        animation: `${fadeIn} 1s ease-out`,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: "center",
            mb: { xs: 3, sm: 4 },
            animation: `${slideUp} 0.8s ease-out 0.2s backwards`,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: "#E76F51",
              mb: 1,
              fontFamily: "'Work Sans', sans-serif",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem", lg: "3.5rem" },
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {ngo?.name || "NGO"}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#585858",
              fontFamily: "'Work Sans', sans-serif",
              fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
            }}
          >
            Empowering communities through: {ngo?.cause || "Social Work"}
          </Typography>
        </Box>

        <Box
          sx={{
            width: "100%",
            mb: { xs: 3, sm: 4 },
            position: "relative",
            animation: `${slideUp} 0.8s ease-out 0.4s backwards`,
          }}
        >
          <Card
            sx={{
              width: "100%",
              height: { xs: 250, sm: 350, md: 450, lg: 500 },
              borderRadius: 4,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              overflow: "hidden",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 12px 32px rgba(231, 111, 81, 0.3)",
              },
            }}
          >
            <CardMedia
              component="img"
              loading="lazy"
              src={ngo?.ngo_picture || "/default-ngo.png"}
              alt={`${ngo?.name || "NGO"} image`}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.5s ease, opacity 0.5s ease",
                "&:hover": { transform: "scale(1.05)", opacity: 0.95 },
              }}
            />
            <Button
              onClick={handleFavoriteToggle}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                bgcolor: "rgba(255,255,255,0.85)",
                borderRadius: "50%",
                minWidth: 48,
                height: 48,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                "&:hover": { bgcolor: "#fff", transform: "scale(1.1)" },
              }}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <FavoriteIcon sx={{ color: isFavorite ? "#E76F51" : "#585858", fontSize: 28 }} />
            </Button>
          </Card>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 4,
                boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                animation: `${slideUp} 0.8s ease-out 0.6s backwards`,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 10px 28px rgba(231, 111, 81, 0.3)",
                },
                bgcolor: "#fff",
              }}
            >
              <CardContent>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#E76F51",
                    mb: 2,
                    fontFamily: "'Work Sans', sans-serif",
                    fontSize: { xs: "1.5rem", sm: "1.8rem" },
                  }}
                >
                  About {ngo?.name || "NGO"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#585858",
                    lineHeight: 1.7,
                    fontFamily: "'Work Sans', sans-serif",
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  {ngo?.description || "No description available."}
                </Typography>
                <Divider sx={{ my: 2, bgcolor: "#FFE5D9" }} />
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    color: "#585858",
                    fontFamily: "'Work Sans', sans-serif",
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  📍 Location: {ngo?.location || "N/A"}
                </Typography>
                {ngo?.contact_info && (
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      color: "#585858",
                      fontFamily: "'Work Sans', sans-serif",
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                    }}
                  >
                    ☎️ Contact: {ngo.contact_info}
                  </Typography>
                )}
                {ngo?.cause && (
                  <Chip
                    label={`Cause: ${ngo.cause}`}
                    sx={{
                      bgcolor: "#FFE5D9",
                      color: "#E76F51",
                      fontWeight: 600,
                      fontFamily: "'Work Sans', sans-serif",
                      borderRadius: "8px",
                      mt: 1,
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      transition: "transform 0.3s ease",
                      "&:hover": { transform: "scale(1.05)" },
                    }}
                  />
                )}
                {ngo?.donation_link && (
                  <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                    <Button
                      href={ngo.donation_link}
                      target="_blank"
                      variant="contained"
                      sx={navButtonStyle}
                      aria-label="Visit NGO website"
                    >
                      Visit Website
                    </Button>
                    <Button
                      variant="contained"
                      sx={navButtonStyle}
                      onClick={() => setDonationModalOpen(true)}
                      aria-label="Donate to NGO"
                    >
                      Donate
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "#E76F51",
                mb: 2,
                fontFamily: "'Work Sans', sans-serif",
                fontSize: { xs: "1.5rem", sm: "1.8rem" },
                animation: `${slideUp} 0.8s ease-out 0.8s backwards`,
              }}
            >
              Events by {ngo?.name || "NGO"}
            </Typography>
            {events.length > 0 ? (
              events.map((event, idx) => {
                if (!event) return null;
                const volunteers = Array.isArray(event.volunteers) ? event.volunteers : [];
                const volunteersForEvent = volunteerData?.organizerVolunteers?.filter((v) => v.event?.id === event.id) || [];
                const remainingSlots = event.volunteers_needed ? event.volunteers_needed - volunteers.length : "-";
                return (
                  <Card
                    key={event.id}
                    sx={{
                      mb: 3,
                      borderRadius: 4,
                      boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                      animation: `${slideUp} 0.6s ease-out ${1 + idx * 0.2}s backwards`,
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 10px 28px rgba(231, 111, 81, 0.3)",
                      },
                      bgcolor: "#fff",
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: "#264653",
                          mb: 1,
                          fontFamily: "'Work Sans', sans-serif",
                          fontSize: { xs: "1.2rem", sm: "1.4rem" },
                        }}
                      >
                        {event.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#585858",
                          mb: 1,
                          fontFamily: "'Work Sans', sans-serif",
                          fontSize: { xs: "0.85rem", sm: "0.9rem" },
                        }}
                      >
                        {event.description || "No description available."}
                      </Typography>
                      <Divider sx={{ my: 1, bgcolor: "#FFE5D9" }} />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#585858",
                          fontFamily: "'Work Sans', sans-serif",
                          fontSize: { xs: "0.85rem", sm: "0.9rem" },
                        }}
                      >
                        📅 Date: {parseDate(event.event_date)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#585858",
                          fontFamily: "'Work Sans', sans-serif",
                          fontSize: { xs: "0.85rem", sm: "0.9rem" },
                        }}
                      >
                        📍 Location: {event.location || "TBD"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#585858",
                          fontFamily: "'Work Sans', sans-serif",
                          fontSize: { xs: "0.85rem", sm: "0.9rem" },
                        }}
                      >
                        👥 Volunteers Registered: {volunteersForEvent.length}/{event.volunteers_needed || "-"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#585858",
                          fontWeight: 600,
                          fontFamily: "'Work Sans', sans-serif",
                          fontSize: { xs: "0.85rem", sm: "0.9rem" },
                        }}
                      >
                        Remaining Slots: {remainingSlots}
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                        <Button
                          variant="contained"
                          sx={{
                            ...navButtonStyle,
                            bgcolor: isRegistered(event) ? "#2E7D32" : "#E76F51",
                            "&:hover": {
                              bgcolor: isRegistered(event) ? "#1B5E20" : "#D65A3C",
                              transform: isRegistered(event) ? "none" : "scale(1.05)",
                              boxShadow: isRegistered(event)
                                ? "none"
                                : "0 6px 20px rgba(231, 111, 81, 0.4)",
                            },
                            "&:disabled": {
                              bgcolor: "#B0BEC5",
                              color: "#fff",
                            },
                          }}
                          disabled={isRegistered(event) || (event.volunteers_needed && volunteers.length >= event.volunteers_needed)}
                          onClick={() => handleVolunteerClick(event)}
                          aria-label={isRegistered(event) ? `Registered for ${event.title}` : `Volunteer for ${event.title}`}
                        >
                          {isRegistered(event) ? "Registered ✅" : "Volunteer"}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Typography
                variant="body1"
                sx={{
                  color: "#585858",
                  fontFamily: "'Work Sans', sans-serif",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                No events found for this NGO.
              </Typography>
            )}
          </Grid>
        </Grid>

        <Dialog open={volunteerModalOpen} onClose={() => setVolunteerModalOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle
            sx={{
              fontWeight: 700,
              color: "#E76F51",
              fontFamily: "'Work Sans', sans-serif",
              fontSize: { xs: "1.5rem", sm: "1.8rem" },
            }}
          >
            {selectedEvent?.title || "Event Details"}
          </DialogTitle>
          <DialogContent dividers>
            {selectedEvent ? (
              <Stack spacing={2}>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#585858",
                    fontFamily: "'Work Sans', sans-serif",
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  <strong>Description:</strong> {selectedEvent.description || "No description available."}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#585858",
                    fontFamily: "'Work Sans', sans-serif",
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  <strong>Date:</strong> {parseDate(selectedEvent.event_date)}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#585858",
                    fontFamily: "'Work Sans', sans-serif",
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  <strong>Location:</strong> {selectedEvent.location || "TBD"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#585858",
                    fontFamily: "'Work Sans', sans-serif",
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  <strong>Volunteers Needed:</strong> {selectedEvent.volunteers_needed || "-"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#585858",
                    fontFamily: "'Work Sans', sans-serif",
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  <strong>Volunteers Registered:</strong>{" "}
                  {volunteerData?.organizerVolunteers?.filter((v) => v.event?.id === selectedEvent.id).length || 0}
                </Typography>
              </Stack>
            ) : (
              <Typography
                sx={{
                  color: "#585858",
                  fontFamily: "'Work Sans', sans-serif",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                No event selected.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              sx={{
                ...navButtonStyle,
                bgcolor: selectedEvent && isRegistered(selectedEvent) ? "#2E7D32" : "#E76F51",
                "&:hover": {
                  bgcolor: selectedEvent && isRegistered(selectedEvent) ? "#1B5E20" : "#D65A3C",
                  transform: selectedEvent && isRegistered(selectedEvent) ? "none" : "scale(1.05)",
                },
                "&:disabled": {
                  bgcolor: "#B0BEC5",
                  color: "#fff",
                },
              }}
              onClick={confirmVolunteer}
              disabled={!selectedEvent || isRegistered(selectedEvent)}
              aria-label={selectedEvent && isRegistered(selectedEvent) ? "Already registered" : "Confirm volunteer registration"}
            >
              {selectedEvent && isRegistered(selectedEvent) ? "Already Registered" : "Confirm Registration"}
            </Button>
            <Button
              variant="outlined"
              sx={{
                ...navButtonStyle,
                bgcolor: "#fff",
                color: "#E76F51",
                border: "1px solid #E76F51",
                "&:hover": {
                  bgcolor: "#FFF3EF",
                  borderColor: "#D65A3C",
                  color: "#D65A3C",
                },
              }}
              onClick={() => setVolunteerModalOpen(false)}
              aria-label="Cancel volunteer registration"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={donationModalOpen} onClose={() => setDonationModalOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle
            sx={{
              fontWeight: 700,
              color: "#E76F51",
              textAlign: "center",
              fontFamily: "'Work Sans', sans-serif",
              fontSize: { xs: "1.5rem", sm: "1.8rem" },
            }}
          >
            Support {ngo?.name}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Typography
                variant="body2"
                sx={{
                  color: "#585858",
                  textAlign: "center",
                  fontFamily: "'Work Sans', sans-serif",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                Your contribution helps us continue our mission. Every donation counts!
              </Typography>
              <TextField
                label="Amount (₹)"
                type="number"
                fullWidth
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, color: "#585858" }}>₹</Typography>,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "&:hover fieldset": { borderColor: "#E76F51" },
                    "&.Mui-focused fieldset": { borderColor: "#E76F51" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#585858",
                    "&.Mui-focused": { color: "#E76F51" },
                  },
                  "& .MuiInputBase-input": {
                    fontFamily: "'Work Sans', sans-serif",
                  },
                }}
                InputLabelProps={{
                  sx: { fontFamily: "'Work Sans', sans-serif" },
                }}
                inputProps={{ "aria-label": "Donation amount" }}
              />
              <TextField
                label="Message (optional)"
                multiline
                rows={3}
                fullWidth
                value={donationMessage}
                onChange={(e) => setDonationMessage(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "&:hover fieldset": { borderColor: "#E76F51" },
                    "&.Mui-focused fieldset": { borderColor: "#E76F51" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#585858",
                    "&.Mui-focused": { color: "#E76F51" },
                  },
                  "& .MuiInputBase-input": {
                    fontFamily: "'Work Sans', sans-serif",
                  },
                }}
                InputLabelProps={{
                  sx: { fontFamily: "'Work Sans', sans-serif" },
                }}
                inputProps={{ "aria-label": "Donation message" }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              sx={navButtonStyle}
              onClick={submitDonation}
              aria-label={`Donate ₹${donationAmount || "0"} to ${ngo?.name}`}
            >
              Donate ₹{donationAmount || "0"}
            </Button>
            <Button
              variant="outlined"
              sx={{
                ...navButtonStyle,
                bgcolor: "#fff",
                color: "#E76F51",
                border: "1px solid #E76F51",
                "&:hover": {
                  bgcolor: "#FFF3EF",
                  borderColor: "#D65A3C",
                  color: "#D65A3C",
                },
              }}
              onClick={() => setDonationModalOpen(false)}
              aria-label="Cancel donation"
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

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
                  : snackbar.severity === "warning"
                  ? "#FFF3E0"
                  : "#E0F7FA",
              color: "#264653",
              fontFamily: "'Work Sans', sans-serif",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default NGO_Details;