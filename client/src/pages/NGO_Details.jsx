import React, { useState, useEffect } from "react";
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
  Modal,
  Stack,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import client from "../apolloClient";


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
    fetchPolicy: "network-only",
    client,
  });

  const { data: favoritesData, refetch: refetchFavorites } = useQuery(GET_USER_FAVORITES, {
    fetchPolicy: "network-only",
    client,
  });

  const [addFavoriteMutation] = useMutation(ADD_FAVORITE, { client });
  const [removeFavoriteMutation] = useMutation(REMOVE_FAVORITE, { client });
  const [registerVolunteerMutation] = useMutation(REGISTER_VOLUNTEER, { client });
  const [donateToNGOMutation] = useMutation(DONATE_TO_NGO, { client });



  useEffect(() => {
    if (favoritesData?.userFavorites) {
      const isFav = favoritesData.userFavorites.some((fav) => fav.ngo_id === id);
      setIsFavorite(isFav);
    }
  }, [favoritesData, id]);


  const userId = localStorage.getItem("user_id");

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const isRegistered = (event) => {
    const volunteers = Array.isArray(event.volunteers) ? event.volunteers : [];
    return volunteers.some((v) => v.user_id === userId);
  };

  const handleVolunteerClick = (event) => {
    setSelectedEvent(event);
    setVolunteerModalOpen(true);
  };

  const confirmVolunteer = async () => {
    if (!selectedEvent) return;
    try {
      await registerVolunteerMutation({ variables: { event_id: selectedEvent.id } });
      await refetch(); // ✅ Refetch NGO query to update event cards in real-time
      setSnackbar({ open: true, message: "Successfully registered for the event!", severity: "success" });
    } catch (err) {
      const msg = err.message.includes("already registered")
        ? "You have already registered for this event."
        : err.message;
      setSnackbar({ open: true, message: msg, severity: "warning" });
    } finally {
      setVolunteerModalOpen(false);
    }
  };

  const submitDonation = async () => {
    if (!donationAmount || Number(donationAmount) <= 0) {
      setSnackbar({ open: true, message: "Please enter a valid donation amount.", severity: "error" });
      return;
    }
    try {
      await donateToNGOMutation({
        variables: { ngo_id: data.ngo.id, amount: parseFloat(donationAmount), message: donationMessage || "" },
      });
      await refetch();
      setSnackbar({ open: true, message: `Thank you for donating ₹${donationAmount}!`, severity: "success" });
      setDonationAmount("");
      setDonationMessage("");
      setDonationModalOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Donation failed", severity: "error" });
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        await removeFavoriteMutation({ variables: { ngo_id: id } });
        setSnackbar({ open: true, message: "Removed from favorites", severity: "info" });
        setIsFavorite(false);
      } else {
        const alreadyFav = favoritesData?.userFavorites?.some(fav => fav.ngo_id === id);
        if (alreadyFav) {
          setSnackbar({ open: true, message: "Already in favorites ❤️", severity: "warning" });
          return;
        }
        await addFavoriteMutation({ variables: { ngo_id: id } });
        setSnackbar({ open: true, message: "Added to favorites ❤️", severity: "success" });
        setIsFavorite(true);
      }
      await refetchFavorites();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Action failed", severity: "error" });
    }
  };

  if (loading)
    return <Typography sx={{ textAlign: "center", mt: 10 }}>Loading NGO details...</Typography>;
  if (error)
    return <Typography sx={{ textAlign: "center", mt: 10, color: "red" }}>Error: {error.message}</Typography>;

  const ngo = data?.ngo;
  const events = Array.isArray(ngo?.events) ? ngo.events : [];


  return (
    <Box sx={{ bgcolor: "#f9f9f9", minHeight: "100vh", pt: "80px", pb: 6 }}>
      <Container maxWidth="lg">
     
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: "#E76F51", mb: 1 }}>{ngo?.name || "NGO"}</Typography>
          <Typography variant="h6" sx={{ color: "#555" }}>Empowering communities through: {ngo?.cause || "Social Work"}</Typography>
        </Box>

    
        <Box sx={{ width: "100%", mb: 4, position: "relative" }}>
          <Card sx={{ width: "100%", height: { xs: 300, sm: 450, md: 500 }, borderRadius: 2, boxShadow: 3, overflow: "hidden" }}>
            <CardMedia component="img" src={ngo?.ngo_picture || "/default-ngo.png"} alt={ngo?.name || "NGO"} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <Button onClick={handleFavoriteToggle} sx={{ position: "absolute", top: 20, right: 20, bgcolor: "rgba(255,255,255,0.8)", "&:hover": { bgcolor: "#fff" } }}>
              <FavoriteIcon sx={{ color: isFavorite ? "#E76F51" : "#999", fontSize: 28 }} />
            </Button>
          </Card>
        </Box>

      
        <Grid container spacing={4}>
        
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#E76F51", mb: 2 }}>About {ngo?.name || "NGO"}</Typography>
                <Typography variant="body1" sx={{ color: "#333", lineHeight: 1.6 }}>{ngo?.description || "No description available."}</Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>📍 Location: {ngo?.location || "N/A"}</Typography>
                {ngo?.contact_info && <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>☎️ Contact: {ngo.contact_info}</Typography>}
                {ngo?.cause && <Chip label={`Cause: ${ngo.cause}`} sx={{ bgcolor: "#E76F51", color: "#fff", fontWeight: 600, mt: 1 }} />}
                {ngo?.donation_link && (
                  <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                    <Button href={ngo.donation_link} target="_blank" variant="contained" sx={{ bgcolor: "#E76F51", color: "#fff", fontWeight: 700, borderRadius: "8px", py: 1.2, "&:hover": { bgcolor: "#D65A3C" } }}>Visit Website</Button>
                    <Button variant="contained" sx={{ bgcolor: "#E76F51", color: "#fff", fontWeight: 700, borderRadius: "8px", py: 1.2, "&:hover": { bgcolor: "#D65A3C" } }} onClick={() => setDonationModalOpen(true)}>Donate</Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

       
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#E76F51", mb: 2 }}>Events by {ngo?.name || "NGO"}</Typography>
            {events.length > 0 ? events.map((event) => {
              const volunteers = Array.isArray(event.volunteers) ? event.volunteers : [];
              const remainingSlots = event.volunteers_needed ? event.volunteers_needed - volunteers.length : "-";
              return (
                <Card key={event.id} sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{event.title}</Typography>
                    <Typography variant="body2" sx={{ color: "#555" }}>{event.description || "No description available."}</Typography>
                    <Typography variant="body2" sx={{ color: "#555" }}>📅 Date: {parseDate(event.event_date)}</Typography>
                    <Typography variant="body2" sx={{ color: "#555" }}>📍 Location: {event.location || "TBD"}</Typography>
                    <Typography variant="body2" sx={{ color: "#555" }}>Volunteers Needed: {event.volunteers_needed || "Not specified"}</Typography>
                    <Typography variant="body2" sx={{ color: "#555" }}>Registered Volunteers: {volunteers.length}</Typography>
                    <Typography variant="body2" sx={{ color: "#555", fontWeight: 600 }}>Remaining Slots: {remainingSlots}</Typography>
                    <Button
                      variant="contained"
                      sx={{ mt: 2, bgcolor: isRegistered(event) ? "#2E7D32" : "#E76F51", "&:hover": { bgcolor: isRegistered(event) ? "#1B5E20" : "#D65A3C" } }}
                      disabled={isRegistered(event) || (event.volunteers_needed && volunteers.length >= event.volunteers_needed)}
                      onClick={() => handleVolunteerClick(event)}
                    >
                      {isRegistered(event) ? "Registered ✅" : "Volunteer"}
                    </Button>
                  </CardContent>
                </Card>
              );
            }) : <Typography variant="body1" sx={{ color: "#555" }}>No events found for this NGO.</Typography>}
          </Grid>
        </Grid>

       
        <Modal open={volunteerModalOpen} onClose={() => setVolunteerModalOpen(false)}>
          <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "#fff", p: { xs: 3, sm: 4 }, borderRadius: 3, boxShadow: 24, width: { xs: "90%", sm: 450 } }}>
            {selectedEvent && (
              <Stack spacing={2}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#E76F51", textAlign: "center" }}>{selectedEvent.title}</Typography>
                <Typography variant="body2">{selectedEvent.description || "No description available."}</Typography>
                <Typography variant="body2">📅 Date: {parseDate(selectedEvent.event_date)}</Typography>
                <Typography variant="body2">📍 Location: {selectedEvent.location || "TBD"}</Typography>
                <Typography variant="body2">Remaining Slots: {selectedEvent.volunteers_needed - (selectedEvent.volunteers?.length || 0)}</Typography>
                <Button variant="contained" sx={{ bgcolor: "#E76F51", color: "#fff", fontWeight: 700, "&:hover": { bgcolor: "#D65A3C" } }} onClick={confirmVolunteer} disabled={isRegistered(selectedEvent)}>{isRegistered(selectedEvent) ? "Already Registered" : "Confirm Registration"}</Button>
                <Button variant="outlined" sx={{ borderColor: "#E76F51", color: "#E76F51", "&:hover": { borderColor: "#D65A3C", color: "#D65A3C" } }} onClick={() => setVolunteerModalOpen(false)}>Cancel</Button>
              </Stack>
            )}
          </Box>
        </Modal>

        <Modal open={donationModalOpen} onClose={() => setDonationModalOpen(false)}>
          <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "#fff", p: { xs: 3, sm: 4 }, borderRadius: 3, boxShadow: 24, width: { xs: "90%", sm: 450 } }}>
            <Stack spacing={2}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#E76F51", textAlign: "center" }}>Support {ngo?.name}</Typography>
              <Typography variant="body2" sx={{ color: "#555", textAlign: "center" }}>Your contribution helps us continue our mission. Every donation counts!</Typography>
              <TextField label="Amount (₹)" type="number" fullWidth value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography> }} />
              <TextField label="Message (optional)" multiline rows={3} fullWidth value={donationMessage} onChange={(e) => setDonationMessage(e.target.value)} />
              <Button variant="contained" sx={{ bgcolor: "#E76F51", color: "#fff", fontWeight: 700, "&:hover": { bgcolor: "#D65A3C" } }} onClick={submitDonation}>Donate ₹{donationAmount || "0"}</Button>
              <Button variant="outlined" sx={{ borderColor: "#E76F51", color: "#E76F51", "&:hover": { borderColor: "#D65A3C", color: "#D65A3C" } }} onClick={() => setDonationModalOpen(false)}>Cancel</Button>
            </Stack>
          </Box>
        </Modal>

      
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}><Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>{snackbar.message}</Alert></Snackbar>
      </Container>
    </Box>
  );
};

export default NGO_Details;
