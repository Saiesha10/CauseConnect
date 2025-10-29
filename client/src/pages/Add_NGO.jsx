import React, { useState, useEffect, useCallback } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Snackbar,
  InputAdornment,
  IconButton,
  CardMedia,
  keyframes,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import LinkIcon from "@mui/icons-material/Link";
import DescriptionIcon from "@mui/icons-material/Description";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import { uploadToCloudinary } from "../utils/cloudinary";

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

// GraphQL Queries & Mutations
export const CREATE_NGO = gql`
  mutation createNGO(
    $name: String!
    $cause: String!
    $description: String!
    $location: String!
    $contact_info: String
    $donation_link: String
    $ngo_picture: String
  ) {
    createNGO(
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

export const UPDATE_NGO = gql`
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

export const GET_NGO_BY_ID = gql`
  query ngo($id: ID!) {
    ngo(id: $id) {
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

const Add_NGO = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    cause: "",
    description: "",
    location: "",
    contact_info: "",
    donation_link: "",
    ngo_picture: "",
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [imageUploading, setImageUploading] = useState(false);

  const { data: ngoData, loading: loadingNGO } = useQuery(GET_NGO_BY_ID, {
    variables: { id },
    skip: !isEditing,
  });

  useEffect(() => {
    if (ngoData?.ngo) {
      setFormData({
        name: ngoData.ngo.name,
        cause: ngoData.ngo.cause,
        description: ngoData.ngo.description,
        location: ngoData.ngo.location,
        contact_info: ngoData.ngo.contact_info || "",
        donation_link: ngoData.ngo.donation_link || "",
        ngo_picture: ngoData.ngo.ngo_picture || "",
      });
    }
  }, [ngoData]);

  const [createNGO, { loading: creating }] = useMutation(CREATE_NGO, {
    onCompleted: (data) => {
      setSnackbar({ open: true, message: "NGO created successfully!", severity: "success" });
      setTimeout(() => navigate(`/ngo/${data.createNGO.id}`), 1500);
    },
    onError: (err) => setSnackbar({ open: true, message: err.message, severity: "error" }),
  });

  const [updateNGO, { loading: updating }] = useMutation(UPDATE_NGO, {
    onCompleted: (data) => {
      setSnackbar({ open: true, message: "NGO updated successfully!", severity: "success" });
      setTimeout(() => navigate(`/ngo/${data.updateNGO.id}`), 1500);
    },
    onError: (err) => setSnackbar({ open: true, message: err.message, severity: "error" }),
  });

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "NGO Name is required";
    if (!formData.cause.trim()) newErrors.cause = "Cause is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, ngo_picture: url }));
      setSnackbar({ open: true, message: "Image uploaded successfully!", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to upload image.", severity: "error" });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSnackbar({ open: true, message: "Please fill all required fields.", severity: "error" });
      return;
    }
    if (isEditing) {
      updateNGO({ variables: { id, ...formData } });
    } else {
      createNGO({ variables: formData });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loadingNGO)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "linear-gradient(135deg, #FDFCFB 0%, #F5F5F5 100%)" }}>
        <CircularProgress sx={{ color: "#E76F51" }} />
      </Box>
    );

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
            {isEditing ? "Edit NGO Details" : "Add New NGO"}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
              ].map((field, idx) => (
                <TextField
                  key={field.name}
                  id={field.name}
                  fullWidth
                  label={field.label}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  multiline={field.multiline}
                  rows={field.rows}
                  error={!!errors[field.name]}
                  helperText={errors[field.name]}
                  InputLabelProps={{ htmlFor: field.name }} 
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

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  component="label"
                  sx={{
                    ...navButtonStyle,
                    bgcolor: imageUploading ? "#B0BEC5" : "#E76F51",
                    "&:hover": imageUploading ? {} : navButtonStyle["&:hover"],
                    animation: `${slideUp} 0.8s ease-out 1.2s backwards`,
                  }}
                  disabled={imageUploading}
                >
                  {imageUploading ? <CircularProgress size={24} color="inherit" /> : "Upload Picture"}
                  <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
                </Button>

                {formData.ngo_picture && (
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      animation: `${fadeIn} 0.8s ease-out`,
                    }}
                  >
                    <CardMedia
                      component="img"
                      src={formData.ngo_picture}
                      alt="NGO Preview"
                      sx={{
                        width: { xs: "100%", sm: 200 },
                        height: { xs: 150, sm: 100 },
                        borderRadius: 2,
                        objectFit: "cover",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        mb: 1,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#585858",
                        fontFamily: "'Work Sans', sans-serif",
                        wordBreak: "break-all",
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      }}
                    >
                      Uploaded: {formData.ngo_picture}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: "flex", gap: 2, mt: 3, animation: `${slideUp} 0.8s ease-out 1.4s backwards` }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    ...navButtonStyle,
                    py: 1.2,
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                  disabled={creating || updating || imageUploading}
                >
                  {(creating || updating) ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : isEditing ? (
                    "Update NGO"
                  ) : (
                    "Add NGO"
                  )}
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

export default Add_NGO;