import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  TextField,
  Paper,
  Chip,
  Snackbar,
  Alert,
  Modal,
} from "@mui/material";

// GraphQL Queries & Mutations
const GET_EVENTS = gql`
  query events($organizerId: ID) {
    events(organizerId: $organizerId) {
      id
      title
      description
      event_date
      location
      volunteers_needed
    }
  }
`;

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

const REGISTER_VOLUNTEER = gql`
  mutation registerVolunteer($event_id: ID!) {
    registerVolunteer(event_id: $event_id) {
      id
      user_id
      event_id
      registered_at
    }
  }
`;

const DELETE_EVENT = gql`
  mutation deleteEvent($id: ID!) {
    deleteEvent(id: $id) {
      id
    }
  }
`;

const UPDATE_EVENT = gql`
  mutation updateEvent(
    $id: ID!
    $title: String
    $description: String
    $event_date: String
    $location: String
    $volunteers_needed: Int
  ) {
    updateEvent(
      id: $id
      title: $title
      description: $description
      event_date: $event_date
      location: $location
      volunteers_needed: $volunteers_needed
    ) {
      id
      title
      description
      event_date
      location
      volunteers_needed
    }
  }
`;


const navButtonStyle = {
  backgroundColor: "#E76F51",
  color: "#fff",
  fontWeight: 700,
  textTransform: "none",
  fontFamily: "'Work Sans', sans-serif",
  borderRadius: "8px",
  px: 2.5,
  "&:hover": { backgroundColor: "#D65A3C" },
};


const parseDate = (timestamp) => {
  if (!timestamp) return "TBD";
  const d = new Date(Number(timestamp));
  return isNaN(d.getTime())
    ? "TBD"
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const EventList = ({ user, organizer = false, userId }) => {
  const { data, loading, error, refetch } = useQuery(GET_EVENTS, {
    variables: { organizerId: organizer ? userId : null },
    fetchPolicy: "cache-and-network",
  });

  const { data: volunteerData, loading: volunteerLoading, error: volunteerError, refetch: refetchVolunteers } = useQuery(GET_ORGANIZER_VOLUNTEERS, {
    fetchPolicy: "cache-and-network",
  });

  const [registerVolunteer, { loading: volunteering }] = useMutation(REGISTER_VOLUNTEER, {
    onCompleted: () => {
      refetch();
      refetchVolunteers();
    },
  });
  const [deleteEvent] = useMutation(DELETE_EVENT, {
    onCompleted: () => {
      refetch();
      refetchVolunteers();
    },
  });
  const [updateEvent] = useMutation(UPDATE_EVENT, {
    onCompleted: () => {
      refetch();
      refetchVolunteers();
    },
  });

  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openEventModal, setOpenEventModal] = useState(false); // For Event Details Modal
  const [openVolunteerModal, setOpenVolunteerModal] = useState(false);
  const [openEditEventModal, setOpenEditEventModal] = useState(false);
  const [editEventData, setEditEventData] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const isRegistered = (event) =>
    user && volunteerData?.organizerVolunteers?.some((v) => v.event?.id === event.id && v.user?.id === user.id);

  const handleVolunteer = async (eventId, event) => {
    if (isRegistered(event)) return alert("You are already registered for this event!");
    try {
      await registerVolunteer({ variables: { event_id: eventId } });
    } catch (err) {
      console.error(err);
      alert("Error registering. Please try again.");
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      await deleteEvent({ variables: { id: eventId } });
    }
  };

  const openEventDetailsModal = (event) => {
    setSelectedEvent(event);
    setOpenEventModal(true);
  };

  const openVolunteersModal = (event) => {
    setSelectedEvent(event);
    setOpenVolunteerModal(true);
  };

  const openEditModal = (event) => {
    setEditEventData(event);
    setOpenEditEventModal(true);
  };

  const handleEventEditChange = (field, value) => setEditEventData({ ...editEventData, [field]: value });

  const handleEventSave = async () => {
    try {
      await updateEvent({
        variables: {
          id: editEventData.id,
          title: editEventData.title,
          description: editEventData.description,
          event_date: editEventData.event_date,
          location: editEventData.location,
          volunteers_needed: editEventData.volunteers_needed,
        },
      });
      setOpenEditEventModal(false);
      setSnackbar({ open: true, message: "Event updated successfully!", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Failed to update event.", severity: "error" });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  if (loading) return <Typography sx={{ textAlign: "center", mt: 6 }}>Loading events...</Typography>;
  if (error) return <Typography color="error" sx={{ textAlign: "center", mt: 6 }}>{error.message}</Typography>;

  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh", pt: "80px" }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ textAlign: "center", color: "#E76F51", fontFamily: "'Work Sans', sans-serif", fontWeight: 700, mb: 4 }}>
          {organizer ? "My Created Events" : "Upcoming Events"}
        </Typography>

        <Grid container spacing={3}>
          {data?.events?.map((event) => {
            const registered = isRegistered(event);
            const volunteersForEvent = volunteerData?.organizerVolunteers?.filter((v) => v.event?.id === event.id) || [];
            return (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%", display: "flex", flexDirection: "column", transition: "transform 0.2s", "&:hover": { transform: "translateY(-5px)" } }}>
                  <CardContent sx={{ flexGrow: 1, cursor: "pointer" }} onClick={() => openEventDetailsModal(event)}>
                    <Typography variant="h6" sx={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 700, color: "#E76F51", mb: 1 }}>{event.title}</Typography>
                    <Typography variant="body2" sx={{ color: "#444", mb: 1 }}>{event.description || "No description available."}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" sx={{ color: "#555", fontWeight: 500 }}>📅 Date: {parseDate(event.event_date)}</Typography>
                    <Typography variant="body2" sx={{ color: "#555", fontWeight: 500 }}>📍 Location: {event.location || "TBD"}</Typography>
                    <Typography variant="body2" sx={{ color: "#555", fontWeight: 500 }}>👥 Volunteers: {volunteersForEvent.length}/{event.volunteers_needed || "-"}</Typography>
                  </CardContent>

                  <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
                    {organizer ? (
                      <Stack direction="row" spacing={1}>
                        <Button variant="contained" sx={navButtonStyle} onClick={() => openEditModal(event)}>Edit</Button>
                        <Button variant="outlined" sx={{ ...navButtonStyle, backgroundColor: "#fff", color: "#E76F51", border: "1px solid #E76F51", "&:hover": { backgroundColor: "#FFF3EF" } }} onClick={() => openVolunteersModal(event)}>View Volunteers</Button>
                        <Button variant="contained" sx={{ ...navButtonStyle, backgroundColor: "#C62828", "&:hover": { backgroundColor: "#B71C1C" } }} onClick={() => handleDelete(event.id)}>Delete</Button>
                      </Stack>
                    ) : (
                      <Button variant="contained" sx={{ ...navButtonStyle, backgroundColor: registered ? "#2E7D32" : "#E76F51", "&:hover": { backgroundColor: registered ? "#1B5E20" : "#D65A3C" } }} onClick={() => handleVolunteer(event.id, event)} disabled={registered || volunteering}>
                        {registered ? "Registered ✅" : volunteering ? "Processing..." : "Volunteer"}
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

  
      <Dialog open={openEventModal} onClose={() => setOpenEventModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700, color: "#E76F51" }}>{selectedEvent?.title}</DialogTitle>
        <DialogContent dividers>
          {selectedEvent ? (
            <Stack spacing={2}>
              <Typography variant="body1"><strong>Description:</strong> {selectedEvent.description || "No description available."}</Typography>
              <Typography variant="body1"><strong>Date:</strong> {parseDate(selectedEvent.event_date)}</Typography>
              <Typography variant="body1"><strong>Location:</strong> {selectedEvent.location || "TBD"}</Typography>
              <Typography variant="body1"><strong>Volunteers Needed:</strong> {selectedEvent.volunteers_needed || "-"}</Typography>
              <Typography variant="body1">
                <strong>Volunteers Registered:</strong> {volunteerData?.organizerVolunteers?.filter(v => v.event?.id === selectedEvent.id).length || 0}
              </Typography>
            </Stack>
          ) : (
            <Typography>Loading event details...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEventModal(false)} sx={{ color: "#E76F51" }}>Close</Button>
        </DialogActions>
      </Dialog>

  
      <Dialog open={openVolunteerModal} onClose={() => setOpenVolunteerModal(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700, color: "#E76F51" }}>Volunteers for: {selectedEvent?.title}</DialogTitle>
        <DialogContent dividers>
          {volunteerLoading ? (
            <Typography>Loading volunteers...</Typography>
          ) : volunteerError ? (
            <Typography color="error">{volunteerError.message}</Typography>
          ) : (
            <Grid container spacing={2}>
              {volunteerData?.organizerVolunteers
                .filter((v) => v.event?.id === selectedEvent?.id)
                .map((vol) => {
                  const status = new Date(vol.event.event_date) > new Date() ? "Upcoming" : "Completed";
                  return (
                    <Grid item xs={12} sm={6} md={4} key={vol.id}>
                      <Paper
                        elevation={3}
                        sx={{ p: 3, borderRadius: 3, bgcolor: "#fff", cursor: "pointer", transition: "0.3s", "&:hover": { transform: "scale(1.03)", boxShadow: 6 } }}
                        onClick={() => setSelectedVolunteer(vol.user)}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{vol.user?.full_name || "N/A"}</Typography>
                          <Chip label={status} color={status === "Upcoming" ? "success" : "default"} size="small" />
                        </Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>Event: <strong>{vol.event?.title || "N/A"}</strong></Typography>
                        <Typography variant="body2" color="text.secondary">Event Date: {parseDate(vol.event?.event_date)}</Typography>
                        <Typography variant="body2" color="text.secondary">Registered on: {parseDate(vol.registered_at)}</Typography>
                      </Paper>
                    </Grid>
                  );
                })}
            </Grid>
          )}

       
          <Modal open={!!selectedVolunteer} onClose={() => setSelectedVolunteer(null)} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Paper sx={{ p: 4, borderRadius: 3, width: 450, maxHeight: "80vh", overflowY: "auto" }}>
              {selectedVolunteer && (
                <Box>
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <Avatar src={selectedVolunteer.profile_picture || ""} alt={selectedVolunteer.full_name} sx={{ width: 100, height: 100, mx: "auto", mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedVolunteer.full_name}</Typography>
                    <Chip label={selectedVolunteer.role} color="primary" size="small" sx={{ mt: 1 }} />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}><strong>Email:</strong> {selectedVolunteer.email}</Typography>
                  {selectedVolunteer.phone && <Typography variant="body2" sx={{ mb: 1 }}><strong>Phone:</strong> {selectedVolunteer.phone}</Typography>}
                  {selectedVolunteer.description && <Typography variant="body2" sx={{ mb: 1 }}><strong>Description:</strong> {selectedVolunteer.description}</Typography>}
                </Box>
              )}
            </Paper>
          </Modal>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVolunteerModal(false)} sx={{ color: "#E76F51" }}>Close</Button>
        </DialogActions>
      </Dialog>

 
      <Dialog open={openEditEventModal} onClose={() => setOpenEditEventModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700, color: "#E76F51" }}>Edit Event</DialogTitle>
        <DialogContent dividers>
          {editEventData && (
            <Stack spacing={2}>
              <TextField label="Title" fullWidth value={editEventData.title} onChange={(e) => handleEventEditChange("title", e.target.value)} />
              <TextField label="Description" fullWidth multiline minRows={3} value={editEventData.description || ""} onChange={(e) => handleEventEditChange("description", e.target.value)} />
              <TextField label="Date" type="date" fullWidth value={editEventData.event_date || ""} InputLabelProps={{ shrink: true }} onChange={(e) => handleEventEditChange("event_date", e.target.value)} />
              <TextField label="Location" fullWidth value={editEventData.location || ""} onChange={(e) => handleEventEditChange("location", e.target.value)} />
              <TextField label="Volunteers Needed" type="number" fullWidth value={editEventData.volunteers_needed || ""} onChange={(e) => handleEventEditChange("volunteers_needed", e.target.value)} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditEventModal(false)}>Cancel</Button>
          <Button variant="contained" sx={{ backgroundColor: "#E76F51" }} onClick={handleEventSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EventList;
