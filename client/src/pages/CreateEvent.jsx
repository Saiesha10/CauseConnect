import React, { useState, useCallback } from "react";
import { Box, TextField, Button, Typography, Card, CardContent, CircularProgress, Snackbar, Alert, InputAdornment } from "@mui/material";
import { useMutation, gql } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupIcon from "@mui/icons-material/Group";
import { keyframes } from "@mui/material";

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

// GraphQL Mutation
export const CREATE_EVENT = gql`
  mutation createEvent(
    $ngo_id: ID!,
    $title: String!,
    $description: String,
    $event_date: String,
    $location: String,
    $volunteers_needed: Int
  ) {
    createEvent(
      ngo_id: $ngo_id,
      title: $title,
      description: $description,
      event_date: $event_date,
      location: $location,
      volunteers_needed: $volunteers_needed
    ) {
      id
      title
      description
      event_date
      location
      volunteers_needed
      ngo {
        name
      }
    }
  }
`;

const CreateEvent = ({ onEventCreated }) => {
  const { ngoId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    volunteers_needed: "",
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [createEvent, { loading }] = useMutation(CREATE_EVENT, {
    onCompleted: (data) => {
      if (onEventCreated) onEventCreated(data.createEvent);
      setFormData({
        title: "",
        description: "",
        event_date: "",
        location: "",
        volunteers_needed: "",
      });
      setSnackbar({ open: true, message: "Event created successfully!", severity: "success" });
      setTimeout(() => navigate(`/ngo/${ngoId}`), 1500);
    },
    onError: (err) => setSnackbar({ open: true, message: err.message, severity: "error" }),
  });

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Event Title is required";
    if (formData.volunteers_needed && isNaN(parseInt(formData.volunteers_needed))) {
      newErrors.volunteers_needed = "Volunteers Needed must be a valid number";
    }
    if (formData.volunteers_needed && parseInt(formData.volunteers_needed) < 0) {
      newErrors.volunteers_needed = "Volunteers Needed cannot be negative";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSnackbar({ open: true, message: "Please fix the errors in the form.", severity: "error" });
      return;
    }
    createEvent({
      variables: {
        ngo_id: ngoId,
        title: formData.title,
        description: formData.description || null,
        event_date: formData.event_date || null,
        location: formData.location || null,
        volunteers_needed: formData.volunteers_needed ? parseInt(formData.volunteers_needed) : null,
      },
    });
  };

  const handleCancel = () => {
    navigate(`/ngo/${ngoId}`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box
      sx={{
        bgcolor: "linear-gradient(135deg, #FDFCFB 0%, #F5F5F5 100%)",
        minHeight: "100vh",
        pt: { xs: 10, sm: 12 },
        pb: 6,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        animation: `${fadeIn} 1s ease-out`,
      }}
    >
      <Card
        sx={{
          width: { xs: "90%", sm: "600px", md: "700px" },
          borderRadius: 4,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0 12px 32px rgba(231, 111, 81, 0.3)",
          },
          bgcolor: "#fff",
          animation: `${slideUp} 0.8s ease-out 0.2s backwards`,
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: 700,
              color: "#E76F51",
              textAlign: "center",
              mb: 3,
              fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
              animation: `${slideUp} 0.8s ease-out 0.4s backwards`,
            }}
          >
            Create New Event
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { label: "Event Title", name: "title", required: true, icon: <EventIcon sx={{ color: "#585858" }} /> },
                {
                  label: "Description",
                  name: "description",
                  multiline: true,
                  rows: 4,
                  icon: <DescriptionIcon sx={{ color: "#585858" }} />,
                },
                {
                  label: "Event Date",
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
                  value={formData[field.name]}
                  onChange={handleChange}
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
                    animation: `${slideUp} 0.8s ease-out ${0.6 + idx * 0.1}s backwards`,
                  }}
                />
              ))}

              <Box sx={{ display: "flex", gap: 2, mt: 3, animation: `${slideUp} 0.8s ease-out 1.2s backwards` }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    ...navButtonStyle,
                    py: 1.2,
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Create Event"}
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
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
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

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

export default CreateEvent;