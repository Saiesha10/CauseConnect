import React, { useState, useCallback } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  CircularProgress,
  Avatar,
  Divider,
  Collapse,
  IconButton,
  Alert,
  Chip,
  Stack,
  Tooltip,
  Snackbar,
  InputAdornment,
  keyframes,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../utils/cloudinary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import DescriptionIcon from "@mui/icons-material/Description";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import LinkIcon from "@mui/icons-material/Link";


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

const GET_ORGANIZER_NGOS = gql`
  query organizerNGOs {
    organizerNGOs {
      id
      name
      cause
      description
      location
      contact_info
      donation_link
      ngo_picture
    }
  }
`;

const GET_ORGANIZER_DONATIONS = gql`
  query organizerDonations {
    organizerDonations {
      id
      amount
      message
      created_at
      user {
        id
        full_name
        email
        phone
        profile_picture
      }
      ngo {
        id
        name
      }
    }
  }
`;

const GET_EVENTS = gql`
  query events($organizerId: ID) {
    events(organizerId: $organizerId) {
      id
      title
      description
      event_date
      location
      volunteers_needed
      ngo {
        id
      }
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

const UPDATE_NGO = gql`
  mutation updateNGO(
    $id: ID!
    $name: String
    $cause: String
    $description: String
    $location: String
    $contact_info: String
    $donation_link: String
    $ngo_picture: String
  ) {
    updateNGO(
      id: $id
      name: $name
      cause: $cause
      description: $description
      location: $location
      contact_info: $contact_info
      donation_link: $donation_link
      ngo_picture: $ngo_picture
    ) {
      id
      name
      cause
      description
      location
      contact_info
      donation_link
      ngo_picture
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

const NGOList = () => {
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [expandedNgo, setExpandedNgo] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [errors, setErrors] = useState({});

  const { data: ngoData, loading: ngosLoading, error: ngosError, refetch: refetchNGOs } = useQuery(GET_ORGANIZER_NGOS, {
    fetchPolicy: "network-only",
  });

  const { data: donationData, loading: donationsLoading, error: donationsError } = useQuery(GET_ORGANIZER_DONATIONS, {
    fetchPolicy: "network-only",
  });

  const { data: eventData, loading: eventsLoading, error: eventsError } = useQuery(GET_EVENTS, {
    variables: { organizerId: null },
    fetchPolicy: "network-only",
  });

  const { data: volunteerData, loading: volunteersLoading, error: volunteersError } = useQuery(GET_ORGANIZER_VOLUNTEERS, {
    fetchPolicy: "network-only",
  });

  const [updateNGO, { loading: updating }] = useMutation(UPDATE_NGO, {
    onCompleted: () => {
      setSnackbar({ open: true, message: "NGO updated successfully!", severity: "success" });
      refetchNGOs();
      setEditingId(null);
    },
    onError: (err) => setSnackbar({ open: true, message: err.message, severity: "error" }),
  });

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "NGO Name is required";
    if (!formData.cause?.trim()) newErrors.cause = "Cause is required";
    if (!formData.description?.trim()) newErrors.description = "Description is required";
    if (!formData.location?.trim()) newErrors.location = "Location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleEditClick = (ngo) => {
    setEditingId(ngo.id);
    setFormData({
      name: ngo.name || "",
      cause: ngo.cause || "",
      description: ngo.description || "",
      location: ngo.location || "",
      contact_info: ngo.contact_info || "",
      donation_link: ngo.donation_link || "",
      ngo_picture: ngo.ngo_picture || "",
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, ngo_picture: url }));
      setSnackbar({ open: true, message: "Image uploaded successfully!", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Image upload failed. Please try again.", severity: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) {
      setSnackbar({ open: true, message: "No NGO selected for update.", severity: "error" });
      return;
    }
    if (!validateForm()) {
      setSnackbar({ open: true, message: "Please fill all required fields.", severity: "error" });
      return;
    }
    await updateNGO({ variables: { id: editingId, ...formData } });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({});
    setErrors({});
  };

  const toggleExpand = (id) => {
    setExpandedNgo(expandedNgo === id ? null : id);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (ngosLoading || donationsLoading || eventsLoading || volunteersLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "linear-gradient(135deg, #FDFCFB 0%, #F5F5F5 100%)" }}>
        <CircularProgress sx={{ color: "#E76F51" }} />
      </Box>
    );

  if (ngosError || donationsError || eventsError || volunteersError)
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", bgcolor: "linear-gradient(135deg, #FDFCFB 0%, #F5F5F5 100%)", pt: 6 }}>
        <Alert severity="error" sx={{ fontFamily: "'Work Sans', sans-serif", fontSize: { xs: "0.9rem", sm: "1rem" }, mb: 2 }}>
          Failed to load data. Please try again.
        </Alert>
        <Button
          variant="contained"
          sx={{ ...navButtonStyle, fontSize: { xs: "0.9rem", sm: "1rem" } }}
          onClick={() => refetchNGOs()}
        >
          Retry
        </Button>
      </Box>
    );

  const ngos = ngoData?.organizerNGOs || [];

  if (ngos.length === 0)
    return (
      <Box sx={{ bgcolor: "linear-gradient(135deg, #FDFCFB 0%, #F5F5F5 100%)", minHeight: "100vh", pt: { xs: 10, sm: 12 }, pb: 6, textAlign: "center" }}>
        <Typography
          sx={{
            fontFamily: "'Work Sans', sans-serif",
            color: "#E76F51",
            fontSize: { xs: "1.2rem", sm: "1.5rem" },
            animation: `${fadeIn} 0.8s ease-out`,
          }}
        >
          No NGOs found. Please create one to get started.
        </Typography>
        <Button
          variant="contained"
          sx={{ ...navButtonStyle, mt: 2, fontSize: { xs: "0.9rem", sm: "1rem" } }}
          onClick={() => navigate("/dashboard/ngo/add")}
        >
          Add NGO
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
        px: { xs: 2, sm: 4 },
        animation: `${fadeIn} 1s ease-out`,
      }}
    >
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
        My NGOs
      </Typography>

      {ngos.map((ngo, idx) => {
        const ngoDonations = donationData?.organizerDonations?.filter((d) => d.ngo.id === ngo.id) || [];
        const ngoEvents = eventData?.events?.filter((e) => e.ngo?.id === ngo.id) || [];
        const ngoVolunteers = volunteerData?.organizerVolunteers?.filter((v) => ngoEvents.some((ev) => ev.id === v.event.id)) || [];

        const totalDonations = ngoDonations.length;
        const totalAmount = ngoDonations.reduce((sum, d) => sum + d.amount, 0);
        const totalEvents = ngoEvents.length;
        const totalVolunteers = ngoVolunteers.length;
        const isExpanded = expandedNgo === ngo.id;

        return (
          <Card
            key={ngo.id}
            sx={{
              mb: 4,
              borderRadius: 4,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: "0 12px 32px rgba(231, 111, 81, 0.3)",
              },
              bgcolor: "#fff",
              animation: `${slideUp} 0.6s ease-out ${0.4 + idx * 0.2}s backwards`,
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              {editingId === ngo.id ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={formData.ngo_picture || "/default-ngo.png"}
                      sx={{
                        width: { xs: 60, sm: 80 },
                        height: { xs: 60, sm: 80 },
                        bgcolor: "#FFE5D9",
                        border: "2px solid #E76F51",
                        mr: 2,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Button
                      variant="contained"
                      component="label"
                      sx={{
                        ...navButtonStyle,
                        bgcolor: uploading ? "#B0BEC5" : "#E76F51",
                        "&:hover": uploading ? {} : navButtonStyle["&:hover"],
                      }}
                      disabled={uploading}
                    >
                      {uploading ? <CircularProgress size={24} color="inherit" /> : "Upload Picture"}
                      <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
                    </Button>
                  </Box>

                  {[
                    { label: "NGO Name", name: "name", required: true, icon: <VolunteerActivismIcon sx={{ color: "#585858" }} /> },
                    { label: "Cause", name: "cause", required: true, icon: <DescriptionIcon sx={{ color: "#585858" }} /> },
                    {
                      label: "Description",
                      name: "description",
                      multiline: true,
                      rows: 4,
                      required: true,
                      icon: <DescriptionIcon sx={{ color: "#585858" }} />,
                    },
                    { label: "Location", name: "location", required: true, icon: <LocationOnIcon sx={{ color: "#585858" }} /> },
                    { label: "Contact Info", name: "contact_info", icon: <ContactMailIcon sx={{ color: "#585858" }} /> },
                    { label: "Donation Link", name: "donation_link", icon: <LinkIcon sx={{ color: "#585858" }} /> },
                  ].map((field, fieldIdx) => (
                    <TextField
                      key={field.name}
                      fullWidth
                      label={field.label}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      required={field.required}
                      multiline={field.multiline}
                      rows={field.rows}
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
                        animation: `${slideUp} 0.8s ease-out ${0.6 + fieldIdx * 0.1}s backwards`,
                      }}
                      inputProps={{ "aria-label": field.label }}
                    />
                  ))}

                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      sx={{ ...navButtonStyle, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                      onClick={handleUpdate}
                      disabled={updating || uploading}
                    >
                      {updating || uploading ? <CircularProgress size={24} color="inherit" /> : "Update"}
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
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, mb: 2 }}>
                    <CardMedia
                      component="img"
                      src={ngo.ngo_picture || "/default-ngo.png"}
                      alt={`${ngo.name} image`}
                      sx={{
                        width: { xs: "100%", sm: 200 },
                        height: { xs: 150, sm: 120 },
                        borderRadius: 2,
                        objectFit: "cover",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        mb: { xs: 2, sm: 0 },
                        mr: { sm: 3 },
                      }}
                    />
                    <Box flex={1}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography
                          variant="h5"
                          sx={{
                            fontFamily: "'Work Sans', sans-serif",
                            fontWeight: 700,
                            color: "#E76F51",
                            fontSize: { xs: "1.5rem", sm: "1.8rem" },
                          }}
                        >
                          {ngo.name}
                        </Typography>
                        <IconButton onClick={() => toggleExpand(ngo.id)} aria-label={isExpanded ? "Collapse details" : "Expand details"}>
                          {isExpanded ? <ExpandLessIcon sx={{ color: "#E76F51" }} /> : <ExpandMoreIcon sx={{ color: "#E76F51" }} />}
                        </IconButton>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#585858",
                          fontFamily: "'Work Sans', sans-serif",
                          fontStyle: "italic",
                          fontSize: { xs: "0.85rem", sm: "0.9rem" },
                        }}
                      >
                        {ngo.cause || "No cause specified"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#585858",
                          fontFamily: "'Work Sans', sans-serif",
                          fontSize: { xs: "0.85rem", sm: "0.9rem" },
                        }}
                      >
                        📍 {ngo.location || "Unknown"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#585858",
                          fontFamily: "'Work Sans', sans-serif",
                          fontSize: { xs: "0.85rem", sm: "0.9rem" },
                        }}
                      >
                        📞 {ngo.contact_info || "No contact info"}
                      </Typography>
                      {ngo.donation_link && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#585858",
                            fontFamily: "'Work Sans', sans-serif",
                            fontSize: { xs: "0.85rem", sm: "0.9rem" },
                          }}
                        >
                          🔗 <a href={ngo.donation_link} target="_blank" rel="noopener noreferrer" style={{ color: "#E76F51" }}>Donation Link</a>
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                    <Chip
                      label={`Donations: ${totalDonations}`}
                      sx={{
                        bgcolor: "#FFE5D9",
                        color: "#E76F51",
                        fontFamily: "'Work Sans', sans-serif",
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      }}
                    />
                    <Chip
                      label={`Raised: ₹${totalAmount}`}
                      sx={{
                        bgcolor: "#E8F5E9",
                        color: "#2E7D32",
                        fontFamily: "'Work Sans', sans-serif",
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      }}
                    />
                    <Chip
                      label={`Events: ${totalEvents}`}
                      sx={{
                        bgcolor: "#E0F7FA",
                        color: "#0277BD",
                        fontFamily: "'Work Sans', sans-serif",
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      }}
                    />
                    <Chip
                      label={`Volunteers: ${totalVolunteers}`}
                      sx={{
                        bgcolor: "#FFF3E0",
                        color: "#EF6C00",
                        fontFamily: "'Work Sans', sans-serif",
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      }}
                    />
                  </Stack>

                  <Collapse in={isExpanded}>
                    <Divider sx={{ my: 2, bgcolor: "#FFE5D9" }} />

                    <Box mb={3}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 700,
                          color: "#264653",
                          mb: 1,
                          fontSize: { xs: "1rem", sm: "1.2rem" },
                        }}
                      >
                        Description
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#585858",
                          fontFamily: "'Work Sans', sans-serif",
                          fontSize: { xs: "0.85rem", sm: "0.9rem" },
                          lineHeight: 1.6,
                        }}
                      >
                        {ngo.description || "No description available."}
                      </Typography>
                    </Box>

                    <Box mb={3}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 700,
                          color: "#264653",
                          mb: 1,
                          fontSize: { xs: "1rem", sm: "1.2rem" },
                        }}
                      >
                        Donations
                      </Typography>
                      {ngoDonations.length > 0 ? (
                        ngoDonations.map((d) => (
                          <Card
                            key={d.id}
                            sx={{
                              p: 2,
                              mb: 1,
                              bgcolor: "#FFF3EF",
                              borderRadius: 2,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar
                                src={d.user?.profile_picture || "/default-user.png"}
                                sx={{ width: 40, height: 40, mr: 2 }}
                              />
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily: "'Work Sans', sans-serif",
                                    color: "#264653",
                                    fontSize: { xs: "0.85rem", sm: "0.9rem" },
                                  }}
                                >
                                  {d.user?.full_name || "Anonymous"} ({d.user?.phone || "-"}) donated ₹{d.amount}
                                  {d.message ? ` - "${d.message}"` : ""}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#585858",
                                    fontFamily: "'Work Sans', sans-serif",
                                    fontSize: { xs: "0.75rem", sm: "0.8rem" },
                                  }}
                                >
                                  {d.user?.email || "-"} | {parseDate(d.created_at)}
                                </Typography>
                              </Box>
                            </Box>
                          </Card>
                        ))
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#585858",
                            fontFamily: "'Work Sans', sans-serif",
                            fontSize: { xs: "0.85rem", sm: "0.9rem" },
                          }}
                        >
                          No donations yet.
                        </Typography>
                      )}
                    </Box>

                    <Box mb={3}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 700,
                          color: "#264653",
                          mb: 1,
                          fontSize: { xs: "1rem", sm: "1.2rem" },
                        }}
                      >
                        Events
                      </Typography>
                      {ngoEvents.length > 0 ? (
                        ngoEvents.map((e) => {
                          const eventVolunteers = volunteerData?.organizerVolunteers?.filter((v) => v.event.id === e.id) || [];
                          return (
                            <Card
                              key={e.id}
                              sx={{
                                p: 2,
                                mb: 2,
                                borderRadius: 2,
                                bgcolor: "#F5FAFF",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              }}
                            >
                              <Typography
                                variant="body1"
                                sx={{
                                  fontFamily: "'Work Sans', sans-serif",
                                  fontWeight: 700,
                                  color: "#E76F51",
                                  fontSize: { xs: "1rem", sm: "1.2rem" },
                                }}
                              >
                                {e.title} ({parseDate(e.event_date)}) - {e.location || "Unknown"}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#585858",
                                  fontFamily: "'Work Sans', sans-serif",
                                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                                  mb: 1,
                                }}
                              >
                                {e.description || "No description"}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#585858",
                                  fontFamily: "'Work Sans', sans-serif",
                                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                                  mb: 1,
                                }}
                              >
                                Volunteers Needed: {e.volunteers_needed || "-"}
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {eventVolunteers.length > 0 ? (
                                  eventVolunteers.map((v) => (
                                    <Tooltip
                                      key={v.id}
                                      title={
                                        <Box>
                                          <Typography variant="body2" sx={{ fontFamily: "'Work Sans', sans-serif" }}>
                                            {v.user?.full_name || "Anonymous"}
                                          </Typography>
                                          <Typography variant="caption" sx={{ fontFamily: "'Work Sans', sans-serif" }}>
                                            📧 {v.user?.email || "-"}
                                          </Typography>
                                          <Typography variant="caption" sx={{ fontFamily: "'Work Sans', sans-serif", display: "block" }}>
                                            📞 {v.user?.phone || "-"}
                                          </Typography>
                                          <Typography variant="caption" sx={{ fontFamily: "'Work Sans', sans-serif", display: "block" }}>
                                            🏷️ {v.user?.role || "-"}
                                          </Typography>
                                          <Typography variant="caption" sx={{ fontFamily: "'Work Sans', sans-serif" }}>
                                            {v.user?.description || ""}
                                          </Typography>
                                        </Box>
                                      }
                                      arrow
                                    >
                                      <Chip
                                        label={v.user?.full_name || "Anonymous"}
                                        avatar={<Avatar src={v.user?.profile_picture || "/default-user.png"} />}
                                        sx={{
                                          bgcolor: "#E0F7FA",
                                          color: "#0277BD",
                                          fontFamily: "'Work Sans', sans-serif",
                                          fontSize: { xs: "0.8rem", sm: "0.9rem" },
                                        }}
                                      />
                                    </Tooltip>
                                  ))
                                ) : (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "#585858",
                                      fontFamily: "'Work Sans', sans-serif",
                                      fontSize: { xs: "0.85rem", sm: "0.9rem" },
                                    }}
                                  >
                                    No volunteers yet.
                                  </Typography>
                                )}
                              </Stack>
                            </Card>
                          );
                        })
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#585858",
                            fontFamily: "'Work Sans', sans-serif",
                            fontSize: { xs: "0.85rem", sm: "0.9rem" },
                          }}
                        >
                          No events yet.
                        </Typography>
                      )}
                    </Box>
                  </Collapse>

                  <Divider sx={{ my: 2, bgcolor: "#FFE5D9" }} />

                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      sx={{ ...navButtonStyle, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                      onClick={() => handleEditClick(ngo)}
                      startIcon={<EditIcon />}
                    >
                      Edit NGO
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
                      onClick={() => navigate(`/dashboard/events/create/${ngo.id}`)}
                      startIcon={<AddCircleIcon />}
                    >
                      Create Event
                    </Button>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}

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

export default NGOList;