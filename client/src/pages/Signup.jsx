import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  Avatar,
  Paper,
  IconButton,
  keyframes,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../utils/cloudinary";

export const SIGNUP_MUTATION = gql`
  mutation signUpUser(
    $full_name: String!
    $email: String!
    $password: String!
    $profile_picture: String
    $role: String!
    $phone: String
    $description: String
  ) {
    signUpUser(
      full_name: $full_name
      email: $email
      password: $password
      profile_picture: $profile_picture
      role: $role
      phone: $phone
      description: $description
    ) {
      token
      user {
        id
        full_name
        role
      }
    }
  }
`;


const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Signup = ({ onSuccess }) => {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [profile_picture, setProfilePicture] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const [signUpUser, { loading }] = useMutation(SIGNUP_MUTATION, {
    onCompleted: (data) => {
      const token = data.signUpUser.token;
      localStorage.setItem("cc_token", token);
      if (onSuccess) onSuccess();
      navigate("/ngos");
    },
    onError: (error) => setErrorMsg(error.message),
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imageUrl = await uploadToCloudinary(file);
      setProfilePicture(imageUrl);
    } catch (err) {
      console.error("Upload failed:", err);
      setErrorMsg("Failed to upload profile picture. Please try again.");
    }
  };

  const handleDeleteImage = () => {
    setProfilePicture("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!role) {
      setErrorMsg("Please select a role before signing up.");
      return;
    }

    signUpUser({
      variables: { full_name, email, password, profile_picture, role, phone, description },
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#FDFCFB",
        py: { xs: 4, sm: 6 },
        animation: `${fadeIn} 0.8s ease-out`,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: { xs: "90%", sm: "400px", md: "450px" },
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          textAlign: "center",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          bgcolor: "#fff",
          animation: `${slideUp} 0.6s ease-out`,
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 8px 25px rgba(231, 111, 81, 0.2)",
          },
        }}
      >
        {/* Logo */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: "'Work Sans', sans-serif",
            fontWeight: 600,
            fontSize: { xs: "1.4rem", sm: "1.6rem" },
            color: "#0B0C10",
            mb: 3,
            animation: `${slideUp} 0.8s ease-out 0.2s backwards`,
          }}
        >
          CauseConnect
          <span
            style={{
              color: "#E76F51",
              fontSize: { xs: "1.4rem", sm: "1.6rem" },
              marginLeft: "3px",
            }}
          >
            .
          </span>
        </Typography>

        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 600,
            fontFamily: "'Work Sans', sans-serif",
            color: "#0B0C10",
            fontSize: { xs: "1.5rem", sm: "1.8rem" },
            animation: `${slideUp} 0.8s ease-out 0.4s backwards`,
          }}
        >
          Create Account
        </Typography>

        {errorMsg && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 2,
              animation: `${fadeIn} 0.5s ease-out`,
            }}
          >
            {errorMsg}
          </Alert>
        )}

        <Box
          sx={{
            position: "relative",
            display: "inline-block",
            mb: 3,
            animation: `${slideUp} 0.8s ease-out 0.5s backwards`,
          }}
        >
          <label htmlFor="profile-upload">
            <input
              type="file"
              accept="image/*"
              id="profile-upload"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
            <Avatar
              src={profile_picture || ""}
              sx={{
                width: { xs: 70, sm: 80 },
                height: { xs: 70, sm: 80 },
                cursor: "pointer",
                bgcolor: "#FFE5D9",
                color: "#E76F51",
                fontWeight: 600,
                border: "2px solid #E76F51",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              {!profile_picture && "Upload"}
            </Avatar>
          </label>

          {profile_picture && (
            <IconButton
              size="small"
              onClick={handleDeleteImage}
              sx={{
                position: "absolute",
                top: -6,
                right: -6,
                bgcolor: "#fff",
                color: "#E76F51",
                "&:hover": { bgcolor: "#FFE5D9" },
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full Name"
            margin="dense"
            value={full_name}
            onChange={(e) => setFullName(e.target.value)}
            required
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "&:hover fieldset": { borderColor: "#E76F51" },
                "&.Mui-focused fieldset": { borderColor: "#E76F51" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#E76F51" },
            }}
            InputLabelProps={{
              sx: { fontFamily: "'Work Sans', sans-serif" },
            }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="dense"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "&:hover fieldset": { borderColor: "#E76F51" },
                "&.Mui-focused fieldset": { borderColor: "#E76F51" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#E76F51" },
            }}
            InputLabelProps={{
              sx: { fontFamily: "'Work Sans', sans-serif" },
            }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="dense"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "&:hover fieldset": { borderColor: "#E76F51" },
                "&.Mui-focused fieldset": { borderColor: "#E76F51" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#E76F51" },
            }}
            InputLabelProps={{
              sx: { fontFamily: "'Work Sans', sans-serif" },
            }}
          />
          <TextField
            select
            fullWidth
            label="Role"
            margin="dense"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "&:hover fieldset": { borderColor: "#E76F51" },
                "&.Mui-focused fieldset": { borderColor: "#E76F51" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#E76F51" },
            }}
            InputLabelProps={{
              sx: { fontFamily: "'Work Sans', sans-serif" },
            }}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="organizer">Organizer</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Phone"
            margin="dense"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "&:hover fieldset": { borderColor: "#E76F51" },
                "&.Mui-focused fieldset": { borderColor: "#E76F51" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#E76F51" },
            }}
            InputLabelProps={{
              sx: { fontFamily: "'Work Sans', sans-serif" },
            }}
          />
          <TextField
            fullWidth
            label="Description / Status"
            margin="dense"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "&:hover fieldset": { borderColor: "#E76F51" },
                "&.Mui-focused fieldset": { borderColor: "#E76F51" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#E76F51" },
            }}
            InputLabelProps={{
              sx: { fontFamily: "'Work Sans', sans-serif" },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 2,
              bgcolor: "#E76F51",
              color: "#fff",
              fontWeight: 700,
              fontFamily: "'Work Sans', sans-serif",
              textTransform: "none",
              borderRadius: "12px",
              py: { xs: 1.2, sm: 1.5 },
              px: { xs: 4, sm: 5 },
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "#D65A3C",
                transform: "scale(1.05)",
                boxShadow: "0 4px 15px rgba(231, 111, 81, 0.4)",
              },
              animation: `${slideUp} 0.8s ease-out 0.6s backwards`,
            }}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </form>

        <Typography
          variant="body2"
          sx={{
            mt: 2,
            color: "#585858",
            fontFamily: "'Work Sans', sans-serif",
            animation: `${slideUp} 0.8s ease-out 0.8s backwards`,
          }}
        >
          Already have an account?{" "}
          <Box
            component="span"
            sx={{
              color: "#E76F51",
              cursor: "pointer",
              fontWeight: 600,
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={() => navigate("/login")}
          >
            Login
          </Box>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Signup;