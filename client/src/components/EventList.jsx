import React, { useState, useCallback } from "react";
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
  CircularProgress,
  InputAdornment,
  keyframes,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupIcon from "@mui/icons-material/Group";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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


export const GET_EVENTS=gql`
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

export const DELETE_EVENT = gql`
  mutation deleteEvent($id: ID!) {
    deleteEvent(id: $id) {
      id
    }
  }
`;

export const UPDATE_EVENT = gql`
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

const parseDate = (timestamp) => {
  if (!timestamp) return "TBD";
  const d = new Date(Number(timestamp) || timestamp);
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
      setSnackbar({ open: true, message: "Successfully registered as a volunteer!", severity: "success" });
      refetch();
      refetchVolunteers();
    },
    onError: (err) => setSnackbar({ open: true, message: err.message, severity: "error" }),
  });

  const [deleteEvent] = useMutation(DELETE_EVENT, {
    onCompleted: () => {
      setSnackbar({ open: true, message: "Event deleted successfully!", severity: "success" });
      refetch();
      refetchVolunteers();
    },
    onError: (err) => setSnackbar({ open: true, message: err.message, severity: "error" }),
  });

  const [updateEvent] = useMutation(UPDATE_EVENT, {
    onCompleted: () => {
      setSnackbar({ open: true, message: "Event updated successfully!", severity: "success" });
      refetch();
      refetchVolunteers();
      setOpenEditEventModal(false);
    },
    onError: (err) => setSnackbar({ open: true, message: err.message, severity: "error" }),
  });

  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openEventModal, setOpenEventModal] = useState(false);
  const [openVolunteerModal, setOpenVolunteerModal] = useState(false);
  const [openEditEventModal, setOpenEditEventModal] = useState(false);
  const [editEventData, setEditEventData] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [errors, setErrors] = useState({});

  const isRegistered = (event) =>
    user && volunteerData?.organizerVolunteers?.some((v) => v.event?.id === event.id && v.user?.id === user.id);

  const validateEditForm = useCallback(() => {
    const newErrors = {};
    if (!editEventData?.title?.trim()) newErrors.title = "Event Title is required";
    if (editEventData?.volunteers_needed && isNaN(parseInt(editEventData.volunteers_needed))) {
      newErrors.volunteers_needed = "Volunteers Needed must be a valid number";
    }
    if (editEventData?.volunteers_needed && parseInt(editEventData.volunteers_needed) < 0) {
      newErrors.volunteers_needed = "Volunteers Needed cannot be negative";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [editEventData]);

  const handleVolunteer = async (eventId, event) => {
    if (isRegistered(event)) {
      setSnackbar({ open: true, message: "You are already registered for this event!", severity: "warning" });
      return;
    }
    await registerVolunteer({ variables: { event_id: eventId } });
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
    setEditEventData({
      id: event.id,
      title: event.title || "",
      description: event.description || "",
      event_date: event.event_date || "",
      location: event.location || "",
      volunteers_needed: event.volunteers_needed || "",
    });
    setErrors({});
    setOpenEditEventModal(true);
  };

  const handleEventEditChange = (field, value) => {
    setEditEventData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleEventSave = async () => {
  if (!validateEditForm()) {
    setSnackbar({ open: true, message: "Please fix the errors in the form.", severity: "error" });
    return;
  }

  // ✅ Ensure event_date is valid and properly formatted
  let formattedDate = null;
  if (editEventData.event_date) {
    const date = new Date(editEventData.event_date);
    if (!isNaN(date.getTime())) {
      formattedDate = date.toISOString(); // convert to ISO string
    }
  }

  await updateEvent({
    variables: {
      id: editEventData.id,
      title: editEventData.title,
      description: editEventData.description || null,
      event_date: formattedDate, // ✅ use ISO date or null
      location: editEventData.location || null,
      volunteers_needed: editEventData.volunteers_needed
        ? parseInt(editEventData.volunteers_needed)
        : null,
    },
  });
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
          {error.message}
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
          {organizer ? "My Created Events" : "Upcoming Events"}
        </Typography>

        <Grid container spacing={3}>
          {data?.events?.map((event, idx) => {
            const registered = isRegistered(event);
            const volunteersForEvent = volunteerData?.organizerVolunteers?.filter((v) => v.event?.id === event.id) || [];
            return (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 12px 32px rgba(231, 111, 81, 0.3)",
                    },
                    animation: `${slideUp} 0.6s ease-out ${0.4 + idx * 0.2}s backwards`,
                  }}
                >
                  <CardContent
                    sx={{ flexGrow: 1, cursor: "pointer" }}
                    onClick={() => openEventDetailsModal(event)}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: 700,
                        color: "#E76F51",
                        mb: 1,
                        fontSize: { xs: "1.2rem", sm: "1.4rem" },
                      }}
                    >
                      {event.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#585858",
                        fontFamily: "'Work Sans', sans-serif",
                        mb: 2,
                        fontSize: { xs: "0.85rem", sm: "0.9rem" },
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
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
                        fontWeight: 500,
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
                        fontWeight: 500,
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
                        fontWeight: 500,
                        fontSize: { xs: "0.85rem", sm: "0.9rem" },
                      }}
                    >
                      👥 Volunteers: {volunteersForEvent.length}/{event.volunteers_needed || "-"}
                    </Typography>
                  </CardContent>

                  <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 1, flexWrap: "wrap" }}>
                    {organizer ? (
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          sx={{ ...navButtonStyle, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                          onClick={(e) => { e.stopPropagation(); openEditModal(event); }}
                          startIcon={<EditIcon />}
                        >
                          Edit
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
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          }}
                          onClick={(e) => { e.stopPropagation(); openVolunteersModal(event); }}
                        >
                          View Volunteers
                        </Button>
                        <Button
                          variant="contained"
                          sx={{
                            ...navButtonStyle,
                            bgcolor: "#C62828",
                            "&:hover": { bgcolor: "#B71C1C" },
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          }}
                          onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                          startIcon={<DeleteIcon />}
                        >
                          Delete
                        </Button>
                      </Stack>
                    ) : (
                      <Button
                        variant="contained"
                        sx={{
                          ...navButtonStyle,
                          bgcolor: registered ? "#2E7D32" : "#E76F51",
                          "&:hover": { bgcolor: registered ? "#1B5E20" : "#D65A3C" },
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                        }}
                        onClick={(e) => { e.stopPropagation(); handleVolunteer(event.id, event); }}
                        disabled={registered || volunteering}
                        startIcon={registered ? null : <VolunteerActivismIcon />}
                      >
                        {registered ? "Registered ✅" : volunteering ? <CircularProgress size={24} color="inherit" /> : "Volunteer"}
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      <Dialog
        open={openEventModal}
        onClose={() => setOpenEventModal(false)}
        fullWidth
        maxWidth="sm"
        sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            fontFamily: "'Work Sans', sans-serif",
            fontWeight: 700,
            color: "#E76F51",
            fontSize: { xs: "1.5rem", sm: "1.8rem" },
          }}
        >
          {selectedEvent?.title}
        </DialogTitle>
        <DialogContent dividers>
          {selectedEvent ? (
            <Stack spacing={2}>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "'Work Sans', sans-serif",
                  color: "#585858",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                <strong>Description:</strong> {selectedEvent.description || "No description available."}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "'Work Sans', sans-serif",
                  color: "#585858",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                <strong>Date:</strong> {parseDate(selectedEvent.event_date)}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "'Work Sans', sans-serif",
                  color: "#585858",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                <strong>Location:</strong> {selectedEvent.location || "TBD"}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "'Work Sans', sans-serif",
                  color: "#585858",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                <strong>Volunteers Needed:</strong> {selectedEvent.volunteers_needed || "-"}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "'Work Sans', sans-serif",
                  color: "#585858",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                <strong>Volunteers Registered:</strong> {volunteerData?.organizerVolunteers?.filter((v) => v.event?.id === selectedEvent.id).length || 0}
              </Typography>
            </Stack>
          ) : (
            <Typography
              sx={{
                fontFamily: "'Work Sans', sans-serif",
                color: "#585858",
                fontSize: { xs: "0.9rem", sm: "1rem" },
              }}
            >
              Loading event details...
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenEventModal(false)}
            sx={{
              color: "#E76F51",
              fontFamily: "'Work Sans', sans-serif",
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openVolunteerModal}
        onClose={() => setOpenVolunteerModal(false)}
        fullWidth
        maxWidth="md"
        sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            fontFamily: "'Work Sans', sans-serif",
            fontWeight: 700,
            color: "#E76F51",
            fontSize: { xs: "1.5rem", sm: "1.8rem" },
          }}
        >
          Volunteers for: {selectedEvent?.title}
        </DialogTitle>
        <DialogContent dividers>
          {volunteerLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress sx={{ color: "#E76F51" }} />
            </Box>
          ) : volunteerError ? (
            <Alert severity="error" sx={{ fontFamily: "'Work Sans', sans-serif", fontSize: { xs: "0.9rem", sm: "1rem" } }}>
              {volunteerError.message}
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {volunteerData?.organizerVolunteers
                ?.filter((v) => v.event?.id === selectedEvent?.id)
                ?.map((vol) => {
                  const status = new Date(vol.event.event_date) > new Date() ? "Upcoming" : "Completed";
                  return (
                    <Grid item xs={12} sm={6} md={4} key={vol.id}>
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          bgcolor: "#FFF3EF",
                          cursor: "pointer",
                          transition: "transform 0.3s ease, box-shadow 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.03)",
                            boxShadow: "0 6px 20px rgba(231, 111, 81, 0.3)",
                          },
                        }}
                        onClick={() => setSelectedVolunteer(vol.user)}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontFamily: "'Work Sans', sans-serif",
                              fontWeight: 600,
                              color: "#264653",
                              fontSize: { xs: "1rem", sm: "1.1rem" },
                            }}
                          >
                            {vol.user?.full_name || "N/A"}
                          </Typography>
                          <Chip
                            label={status}
                            color={status === "Upcoming" ? "success" : "default"}
                            size="small"
                            sx={{ fontFamily: "'Work Sans', sans-serif" }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "'Work Sans', sans-serif",
                            color: "#585858",
                            fontSize: { xs: "0.85rem", sm: "0.9rem" },
                          }}
                        >
                          Event: <strong>{vol.event?.title || "N/A"}</strong>
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "'Work Sans', sans-serif",
                            color: "#585858",
                            fontSize: { xs: "0.85rem", sm: "0.9rem" },
                          }}
                        >
                          Event Date: {parseDate(vol.event?.event_date)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "'Work Sans', sans-serif",
                            color: "#585858",
                            fontSize: { xs: "0.85rem", sm: "0.9rem" },
                          }}
                        >
                          Registered on: {parseDate(vol.registered_at)}
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
            </Grid>
          )}
          {volunteerData?.organizerVolunteers?.filter((v) => v.event?.id === selectedEvent?.id).length === 0 && (
            <Typography
              sx={{
                fontFamily: "'Work Sans', sans-serif",
                color: "#585858",
                fontSize: { xs: "0.9rem", sm: "1rem" },
                textAlign: "center",
                mt: 2,
              }}
            >
              No volunteers registered for this event.
            </Typography>
          )}

          <Modal
            open={!!selectedVolunteer}
            onClose={() => setSelectedVolunteer(null)}
            sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Paper
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
              {selectedVolunteer && (
                <Box>
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <Avatar
                      src={selectedVolunteer.profile_picture || ""}
                      alt={selectedVolunteer.full_name}
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
                        fontWeight: 600,
                        color: "#264653",
                        fontSize: { xs: "1.2rem", sm: "1.4rem" },
                      }}
                    >
                      {selectedVolunteer.full_name}
                    </Typography>
                    <Chip
                      label={selectedVolunteer.role}
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
                      mb: 1,
                      fontSize: { xs: "0.85rem", sm: "0.9rem" },
                    }}
                  >
                    <strong>Email:</strong> {selectedVolunteer.email}
                  </Typography>
                  {selectedVolunteer.phone && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "'Work Sans', sans-serif",
                        color: "#585858",
                        mb: 1,
                        fontSize: { xs: "0.85rem", sm: "0.9rem" },
                      }}
                    >
                      <strong>Phone:</strong> {selectedVolunteer.phone}
                    </Typography>
                  )}
                  {selectedVolunteer.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "'Work Sans', sans-serif",
                        color: "#585858",
                        mb: 1,
                        fontSize: { xs: "0.85rem", sm: "0.9rem" },
                      }}
                    >
                      <strong>Description:</strong> {selectedVolunteer.description}
                    </Typography>
                  )}
                </Box>
              )}
              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Button
                  onClick={() => setSelectedVolunteer(null)}
                  sx={{
                    color: "#E76F51",
                    fontFamily: "'Work Sans', sans-serif",
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  Close
                </Button>
              </Box>
            </Paper>
          </Modal>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenVolunteerModal(false)}
            sx={{
              color: "#E76F51",
              fontFamily: "'Work Sans', sans-serif",
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEditEventModal}
        onClose={() => setOpenEditEventModal(false)}
        fullWidth
        maxWidth="sm"
        sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            fontFamily: "'Work Sans', sans-serif",
            fontWeight: 700,
            color: "#E76F51",
            fontSize: { xs: "1.5rem", sm: "1.8rem" },
          }}
        >
          Edit Event
        </DialogTitle>
        <DialogContent dividers>
          {editEventData && (
            <Stack spacing={2}>
              {[
                { label: "Title", name: "title", required: true, icon: <EventIcon sx={{ color: "#585858" }} /> },
                {
                  label: "Description",
                  name: "description",
                  multiline: true,
                  rows: 4,
                  icon: <DescriptionIcon sx={{ color: "#585858" }} />,
                },
                {
                  label: "Date",
                  name: "event_date",
                  type: "date",
                  InputLabelProps: { shrink: true },
                  icon: <EventIcon sx={{ color: "#585858" }} />,
                },
                { label: "Location", name: "location", icon: <LocationOnIcon sx={{ color: "#585858" }} /> },
                {
                  label: "Volunteers Needed",
                  name: "volunteers_needed",
                  type: "number",
                  icon: <GroupIcon sx={{ color: "#585858" }} />,
                },
              ].map((field, idx) => (
                <TextField
                  key={field.name}
                  fullWidth
                  label={field.label}
                  name={field.name}
                  value={editEventData[field.name] || ""}
                  onChange={(e) => handleEventEditChange(field.name, e.target.value)}
                  required={field.required}
                  type={field.type || "text"}
                  multiline={field.multiline}
                  rows={field.rows}
                  InputLabelProps={field.InputLabelProps}
                  error={!!errors[field.name]}
                  helperText={errors[field.name]}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {field.icon}
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      "&:hover fieldset": { borderColor: "#E76F51" },
                      "&.Mui-focused fieldset": { borderColor: "#E76F51" },
                      fontFamily: "'Work Sans', sans-serif",
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#585858",
                      "&.Mui-focused": { color: "#E76F51" },
                      fontFamily: "'Work Sans', sans-serif",
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                    },
                    animation: `${slideUp} 0.8s ease-out ${0.4 + idx * 0.1}s backwards`,
                  }}
                  inputProps={{ "aria-label": field.label }}
                />
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenEditEventModal(false)}
            sx={{
              color: "#E76F51",
              fontFamily: "'Work Sans', sans-serif",
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{ ...navButtonStyle, fontSize: { xs: "0.9rem", sm: "1rem" } }}
            onClick={handleEventSave}
            disabled={volunteering }
          >
            Save
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
    </Box>
  );
};

export default EventList;