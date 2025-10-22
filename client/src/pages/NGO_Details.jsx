import React, { useState } from "react";
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
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";


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
        }
      }
    }
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

const NGO_Details = ({ user }) => {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [registeredEvents, setRegisteredEvents] = useState([]);

  const { loading, error, data, refetch } = useQuery(GET_NGO, { variables: { id } });
  const [registerVolunteer] = useMutation(REGISTER_VOLUNTEER);

  if (loading)
    return <Typography sx={{ textAlign: "center", mt: 10 }}>Loading NGO details...</Typography>;

  if (error)
    return <Typography sx={{ textAlign: "center", mt: 10, color: "red" }}>Error: {error.message}</Typography>;

  const ngo = data?.ngo;
  const events = Array.isArray(ngo?.events) ? ngo.events : [];

  const handleVolunteer = async (event) => {
    if (!user || (user.role !== "user" && user.role !== "organizer")) {
      setModalMessage("Please log in as a user or organizer to volunteer!");
      setOpenModal(true);
      return;
    }

    if (event.volunteers_needed && event.volunteers?.length >= event.volunteers_needed) {
      setModalMessage("No more volunteer slots needed, but you can still attend the event!");
      setOpenModal(true);
      return;
    }

    if (registeredEvents.includes(event.id)) return;

    try {
      await registerVolunteer({ variables: { event_id: event.id } });
      setRegisteredEvents((prev) => [...prev, event.id]);
      await refetch();
      setModalMessage("You are successfully registered as a volunteer!");
      setOpenModal(true);
    } catch (err) {
      console.error(err);
      setModalMessage(err.message || "Error registering as volunteer. Please try again.");
      setOpenModal(true);
    }
  };

  const isRegistered = (event) =>
    registeredEvents.includes(event.id) ||
    (Array.isArray(event.volunteers) && event.volunteers.some((v) => v.id === user?.id));

  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh", pt: "80px" }}>
      <Container maxWidth="lg">

        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h3" sx={{ fontFamily: "'Work Sans', sans-serif", color: "#E76F51", fontWeight: 700, mb: 1 }}>
            {ngo?.name || "NGO"}
          </Typography>
          <Typography variant="h6" sx={{ fontFamily: "'Work Sans', sans-serif", color: "#333", fontWeight: 600 }}>
            Empowering communities through: {ngo?.cause || "Social Work"}
          </Typography>
        </Box>
        <Box sx={{ width: "100%", mb: 4, position: "relative" }}>
          <Card sx={{ width: "100%", height: { xs: 300, sm: 450, md: 500 }, borderRadius: 2, boxShadow: 3, overflow: "hidden" }}>
            <CardMedia
              component="img"
              src={ngo?.ngo_picture || "/default-ngo.png"}
              alt={ngo?.name || "NGO"}
              sx={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
            />
            <Button
              onClick={() => setIsFavorite(!isFavorite)}
              sx={{
                position: "absolute",
                top: 20,
                right: 20,
                bgcolor: "rgba(255,255,255,0.8)",
                "&:hover": { bgcolor: "#fff" },
              }}
            >
              <FavoriteIcon sx={{ color: isFavorite ? "#E76F51" : "#999", fontSize: 28 }} />
            </Button>
          </Card>
        </Box>

        <Grid container spacing={4} sx={{ mb: 6 }}>
        
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 700, color: "#E76F51", mb: 2 }}>
                  About {ngo?.name || "NGO"}
                </Typography>
                <Typography variant="body1" sx={{ color: "#333", fontFamily: "'Work Sans', sans-serif", fontWeight: 500, lineHeight: 1.6 }}>
                  {ngo?.description || "No description available."}
                </Typography>

                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>📍 Location: <span style={{ fontWeight: 500 }}>{ngo?.location || "N/A"}</span></Typography>
                {ngo?.contact_info && <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>☎️ Contact: <span style={{ fontWeight: 500 }}>{ngo.contact_info}</span></Typography>}
                {ngo?.cause && <Chip label={`Cause: ${ngo.cause}`} sx={{ bgcolor: "#E76F51", color: "#fff", fontWeight: 600, mt: 1 }} />}

                {ngo?.donation_link && (
                  <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                    <Button
                      href={ngo.donation_link}
                      target="_blank"
                      variant="contained"
                      sx={{
                        bgcolor: "#E76F51",
                        color: "#fff",
                        fontWeight: 700,
                        fontFamily: "'Work Sans', sans-serif",
                        textTransform: "none",
                        borderRadius: "8px",
                        py: 1.2,
                        "&:hover": { bgcolor: "#D65A3C" },
                      }}
                    >
                      Donate Now!
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 700, color: "#E76F51", mb: 2 }}>
              Events by {ngo?.name || "NGO"}
            </Typography>

            {events.length > 0 ? events.map((event) => (
              <Card key={event.id} sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{event.title}</Typography>
                  <Typography variant="body2" sx={{ color: "#555" }}>{event.description || "No description available."}</Typography>
                  <Typography variant="body2" sx={{ color: "#555" }}>Date: {event.event_date ? new Date(event.event_date).toLocaleDateString() : "TBD"}</Typography>
                  <Typography variant="body2" sx={{ color: "#555" }}>Location: {event.location || "TBD"}</Typography>
                  <Typography variant="body2" sx={{ color: "#555" }}>Volunteers Needed: {event.volunteers_needed || "Not specified"}</Typography>
                  <Typography variant="body2" sx={{ color: "#555" }}>Registered Volunteers: {Array.isArray(event.volunteers) ? event.volunteers.length : 0}</Typography>

                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      bgcolor: isRegistered(event) ? "#2E7D32" : "#E76F51",
                      "&:hover": { bgcolor: isRegistered(event) ? "#1B5E20" : "#D65A3C" },
                    }}
                    onClick={() => handleVolunteer(event)}
                    disabled={isRegistered(event)}
                  >
                    {isRegistered(event) ? "Registered ✅" : "Volunteer"}
                  </Button>
                </CardContent>
              </Card>
            )) : (
              <Typography variant="body1" sx={{ color: "#555" }}>No events found for this NGO.</Typography>
            )}
          </Grid>
        </Grid>

      
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "#fff", p: 4, borderRadius: 2, boxShadow: 24, minWidth: 300, textAlign: "center" }}>
            <Typography>{modalMessage}</Typography>
            <Button onClick={() => setOpenModal(false)} sx={{ mt: 2, bgcolor: "#E76F51", color: "#fff", "&:hover": { bgcolor: "#D65A3C" } }}>Close</Button>
          </Box>
        </Modal>
      </Container>
    </Box>
  );
};

export default NGO_Details;
