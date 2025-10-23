import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import {
  Box,
  Typography,
  Paper,
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../utils/cloudinary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";


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

  const { data: ngoData, loading: ngosLoading, error: ngosError, refetch: refetchNGOs } =
    useQuery(GET_ORGANIZER_NGOS, { fetchPolicy: "network-only" });

  const { data: donationData, loading: donationsLoading, error: donationsError } =
    useQuery(GET_ORGANIZER_DONATIONS, { fetchPolicy: "network-only" });

  const { data: eventData, loading: eventsLoading, error: eventsError } = useQuery(GET_EVENTS, {
    variables: { organizerId: null },
    fetchPolicy: "network-only",
  });

  const { data: volunteerData, loading: volunteersLoading, error: volunteersError } =
    useQuery(GET_ORGANIZER_VOLUNTEERS, { fetchPolicy: "network-only" });

  const [updateNGO, { loading: updating }] = useMutation(UPDATE_NGO, {
    onCompleted: () => {
      alert("✅ NGO updated successfully!");
      refetchNGOs();
      setEditingId(null);
    },
    onError: (err) => alert(`❌ ${err.message}`),
  });

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [expandedNgo, setExpandedNgo] = useState(null);

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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, ngo_picture: url }));
    } catch (err) {
      console.error(err);
      alert("❌ Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return alert("No NGO selected for update.");
    await updateNGO({ variables: { id: editingId, ...formData } });
  };

  const toggleExpand = (id) => {
    setExpandedNgo(expandedNgo === id ? null : id);
  };

  if (ngosLoading || donationsLoading || eventsLoading || volunteersLoading)
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress color="warning" />
      </Box>
    );

  if (ngosError || donationsError || eventsError || volunteersError)
    return (
      <Box mt={4} textAlign="center">
        <Alert severity="error">⚠️ Failed to load data. Please refresh.</Alert>
        <Button onClick={() => refetchNGOs()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );

  const ngos = ngoData?.organizerNGOs || [];
  const donations = donationData?.organizerDonations || [];
  const events = eventData?.events || [];
  const volunteers = volunteerData?.organizerVolunteers || [];

  if (ngos.length === 0)
    return (
      <Typography sx={{ mt: 4, textAlign: "center" }}>
        No NGOs found. Please create one to get started.
      </Typography>
    );

  return (
    <Box p={{ xs: 2, md: 4 }}>
      <Typography variant="h4" mb={3} color="#E76F51" fontWeight="bold">
        My NGOs
      </Typography>

      {ngos.map((ngo) => {
        const ngoDonations = donations.filter((d) => d.ngo.id === ngo.id);
        const ngoEvents = events.filter((e) => e.ngo?.id === ngo.id);
        const ngoVolunteers = volunteers.filter((v) => ngoEvents.some((ev) => ev.id === v.event.id));

        const totalDonations = ngoDonations.length;
        const totalAmount = ngoDonations.reduce((sum, d) => sum + d.amount, 0);
        const totalEvents = ngoEvents.length;
        const totalVolunteers = ngoVolunteers.length;

        const isExpanded = expandedNgo === ngo.id;

        return (
          <Paper
            key={ngo.id}
            elevation={6}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 4,
              bgcolor: "#fff7f5",
              boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
              transition: "transform 0.2s ease",
              "&:hover": { transform: "scale(1.02)" },
            }}
          >
            {editingId === ngo.id ? (
              <>
         
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    src={formData.ngo_picture}
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: "#FFE5D9",
                      border: "2px solid #E76F51",
                      mr: 2,
                    }}
                  />
                  <Button
                    variant="contained"
                    component="label"
                    sx={{ backgroundColor: "#E76F51", textTransform: "none" }}
                  >
                    {uploading ? "Uploading..." : "Upload Picture"}
                    <input type="file" hidden onChange={handleImageUpload} />
                  </Button>
                </Box>

                {["name", "cause", "description", "location", "contact_info", "donation_link"].map((field) => (
                  <TextField
                    key={field}
                    fullWidth
                    name={field}
                    label={field.replace("_", " ").toUpperCase()}
                    value={formData[field]}
                    onChange={handleInputChange}
                    margin="dense"
                    multiline={field === "description"}
                    rows={field === "description" ? 3 : 1}
                  />
                ))}

                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: "#4caf50" }}
                    onClick={handleUpdate}
                    disabled={updating || uploading}
                  >
                    {updating || uploading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Update"
                    )}
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </Box>
              </>
            ) : (
              <>
       
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    src={ngo.ngo_picture || "/default-ngo.png"}
                    sx={{
                      width: 90,
                      height: 90,
                      mr: 2,
                      bgcolor: "#FFE5D9",
                      border: "2px solid #E76F51",
                    }}
                  />
                  <Box flex={1}>
                    <Typography variant="h5" fontWeight="bold" color="#E76F51">
                      {ngo.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" fontStyle="italic">
                      {ngo.cause || "No cause specified"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      📍 {ngo.location || "Unknown"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      📞 {ngo.contact_info || "No contact info"}
                    </Typography>
                  </Box>
                  <IconButton onClick={() => toggleExpand(ngo.id)}>
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                  <Chip label={`Donations: ${totalDonations}`} color="primary" size="small" />
                  <Chip label={`Raised: ₹${totalAmount}`} color="success" size="small" />
                  <Chip label={`Events: ${totalEvents}`} color="secondary" size="small" />
                  <Chip label={`Volunteers: ${totalVolunteers}`} color="warning" size="small" />
                </Stack>

            
                <Collapse in={isExpanded}>
                  <Divider sx={{ my: 2 }} />

                
                  <Box mb={2}>
                    <Typography variant="subtitle1" mb={1} fontWeight="bold">
                      Donations
                    </Typography>
                    {ngoDonations.length > 0 ? (
                      ngoDonations.map((d) => {
                        const donorName = d.user?.full_name || "Anonymous";
                        const donorPhone = d.user?.phone || "-";
                        const donorEmail = d.user?.email || "-";
                        return (
                          <Paper
                            key={d.id}
                            variant="outlined"
                            sx={{ p: 1, mb: 1, bgcolor: "#fff3f0" }}
                          >
                            <Box display="flex" alignItems="center">
                              <Avatar
                                src={d.user?.profile_picture || "/default-user.png"}
                                sx={{ width: 35, height: 35, mr: 2 }}
                              />
                              <Box>
                                <Typography variant="body2">
                                  {donorName} ({donorPhone}): ₹{d.amount}{" "}
                                  {d.message ? `- "${d.message}"` : ""}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {donorEmail}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No donations yet.
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

             
                  <Box mb={2}>
                    <Typography variant="subtitle1" mb={1} fontWeight="bold">
                      Events
                    </Typography>
                    {ngoEvents.length > 0 ? (
                      ngoEvents.map((e) => {
                        const eventVolunteers = volunteers.filter((v) => v.event.id === e.id);
                        return (
                          <Paper
                            key={e.id}
                            sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: "#fff0f0" }}
                            elevation={1}
                          >
                            <Typography variant="body1" fontWeight="bold" color="#E76F51">
                              {e.title} ({parseDate(e.event_date)}) - {e.location || "Unknown"}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" mb={1}>
                              {e.description || "No description"}
                            </Typography>
                            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                              {eventVolunteers.length > 0 ? (
                                eventVolunteers.map((v) => {
                                  const volunteerName = v.user?.full_name || "Anonymous";
                                  const volunteerEmail = v.user?.email || "-";
                                  const volunteerPhone = v.user?.phone || "-";
                                  const volunteerRole = v.user?.role || "-";
                                  const volunteerDesc = v.user?.description || "";

                                  return (
                                    <Tooltip
                                      key={v.id}
                                      title={
                                        <>
                                          <Typography variant="body2">{volunteerName}</Typography>
                                          <Typography variant="caption">📧 {volunteerEmail}</Typography>
                                          <br />
                                          <Typography variant="caption">📞 {volunteerPhone}</Typography>
                                          <br />
                                          <Typography variant="caption">🏷️ {volunteerRole}</Typography>
                                          <br />
                                          <Typography variant="caption">{volunteerDesc}</Typography>
                                        </>
                                      }
                                      arrow
                                    >
                                      <Chip
                                        label={volunteerName}
                                        avatar={
                                          <Avatar src={v.user?.profile_picture || "/default-user.png"} />
                                        }
                                        size="small"
                                        color="info"
                                      />
                                    </Tooltip>
                                  );
                                })
                              ) : (
                                <Typography variant="body2" color="textSecondary">
                                  No volunteers yet
                                </Typography>
                              )}
                            </Stack>
                          </Paper>
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No events yet.
                      </Typography>
                    )}
                  </Box>
                </Collapse>

                <Divider sx={{ my: 2 }} />

                {/* Actions */}
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: "#E76F51" }}
                    onClick={() => handleEditClick(ngo)}
                  >
                    Edit NGO
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      borderColor: "#E76F51",
                      color: "#E76F51",
                      "&:hover": { borderColor: "#E76F51" },
                    }}
                    onClick={() => navigate(`/dashboard/events/create/${ngo.id}`)}
                  >
                    Create Event
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        );
      })}
    </Box>
  );
};

export default NGOList;
