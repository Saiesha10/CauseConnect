import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
  InputAdornment,
  Card,
  CardContent,
  keyframes,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import DescriptionIcon from "@mui/icons-material/Description";
import { useNavigate } from "react-router-dom";
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
export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      full_name
      profile_picture
      email
      phone
      role
      description
      created_at
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID!
    $full_name: String
    $profile_picture: String
    $email: String
    $phone: String
    $description: String
  ) {
    updateUser(
      id: $id
      full_name: $full_name
      profile_picture: $profile_picture
      email: $email
      phone: $phone
      description: $description
    ) {
      id
      full_name
      profile_picture
      email
      phone
      description
    }
  }
`;

const ProfileSection = ({ userId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    profile_picture: "",
    email: "",
    phone: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [imageUploading, setImageUploading] = useState(false);

  const { data, loading: userLoading, error: userError } = useQuery(GET_USER, {
    variables: { id: userId },
    skip: !userId,
  });

  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER, {
    onCompleted: () => {
      setSnackbar({ open: true, message: "Profile updated successfully!", severity: "success" });
      setTimeout(() => navigate(-1), 1500);
    },
    onError: (err) => setSnackbar({ open: true, message: err.message, severity: "error" }),
    refetchQueries: [{ query: GET_USER, variables: { id: userId } }],
  });

  useEffect(() => {
    if (data?.user) {
      setFormData({
        full_name: data.user.full_name || "",
        profile_picture: data.user.profile_picture || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
        description: data.user.description || "",
      });
    }
  }, [data]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = "Full Name is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (formData.phone && !/^\+?\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, profile_picture: url }));
      setSnackbar({ open: true, message: "Profile picture uploaded successfully!", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Failed to upload profile picture.", severity: "error" });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setSnackbar({ open: true, message: "User ID is missing.", severity: "error" });
      return;
    }
    if (!validateForm()) {
      setSnackbar({ open: true, message: "Please fix the errors in the form.", severity: "error" });
      return;
    }
    updateUser({
      variables: {
        id: userId,
        full_name: formData.full_name,
        profile_picture: formData.profile_picture,
        email: formData.email || null,
        phone: formData.phone || null,
        description: formData.description || null,
      },
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (userLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "linear-gradient(135deg, #FDFCFB 0%, #F5F5F5 100%)" }}>
        <CircularProgress sx={{ color: "#E76F51" }} />
      </Box>
    );
  if (userError)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "linear-gradient(135deg, #FDFCFB 0%, #F5F5F5 100%)" }}>
        <Alert severity="error" sx={{ fontFamily: "'Work Sans', sans-serif", fontSize: { xs: "0.9rem", sm: "1rem" } }}>
          {userError.message}
        </Alert>
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
          <Box sx={{ display: "flex", alignItems: "center", mb: 3, animation: `${slideUp} 0.8s ease-out 0.4s backwards` }}>
            <Avatar
              src={formData.profile_picture}
              alt={formData.full_name}
              sx={{
                width: { xs: 80, sm: 100 },
                height: { xs: 80, sm: 100 },
                mr: 3,
                border: "2px solid #E76F51",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "'Work Sans', sans-serif",
                  fontWeight: 700,
                  color: "#E76F51",
                  fontSize: { xs: "1.5rem", sm: "1.8rem" },
                }}
              >
                {formData.full_name || "No Name"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#585858",
                  fontFamily: "'Work Sans', sans-serif",
                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                }}
              >
                Role: {data?.user?.role || "N/A"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#585858",
                  fontFamily: "'Work Sans', sans-serif",
                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                }}
              >
                Status: {formData.description || "No status set"}
              </Typography>
            </Box>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { label: "Full Name", name: "full_name", required: true, icon: <PersonIcon sx={{ color: "#585858" }} /> },
                { label: "Email", name: "email", icon: <EmailIcon sx={{ color: "#585858" }} /> },
                { label: "Phone", name: "phone", icon: <PhoneIcon sx={{ color: "#585858" }} /> },
                {
                  label: "Description / Status",
                  name: "description",
                  multiline: true,
                  rows: 4,
                  icon: <DescriptionIcon sx={{ color: "#585858" }} />,
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
                    animation: `${slideUp} 0.8s ease-out ${0.6 + idx * 0.1}s backwards`,
                  }}
                  inputProps={{ "aria-label": field.label }}
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
                  {imageUploading ? <CircularProgress size={24} color="inherit" /> : "Upload Profile Picture"}
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
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
                  disabled={updateLoading || imageUploading || !userId}
                >
                  {updateLoading ? <CircularProgress size={24} color="inherit" /> : "Update Profile"}
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

export default ProfileSection;