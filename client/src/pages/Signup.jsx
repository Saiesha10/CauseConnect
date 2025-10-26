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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../utils/cloudinary";

const SIGNUP_MUTATION = gql`
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
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#fff", pt: "80px" }}>
      <Paper elevation={3} sx={{ width: { xs: "90%", sm: "360px" }, p: 4, borderRadius: 3, textAlign: "center" }}>
        <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
          <label htmlFor="profile-upload">
            <input type="file" accept="image/*" id="profile-upload" style={{ display: "none" }} onChange={handleImageUpload} />
            <Avatar src={profile_picture || ""} sx={{ width: 80, height: 80, cursor: "pointer", bgcolor: "#FFE5D9", color: "#E76F51", fontWeight: 600, border: "2px solid #E76F51" }}>
              {!profile_picture && "Upload"}
            </Avatar>
          </label>

          {profile_picture && (
            <IconButton size="small" onClick={handleDeleteImage} sx={{ position: "absolute", top: -6, right: -6, backgroundColor: "#fff", color: "#E76F51", "&:hover": { backgroundColor: "#FFE5D9" } }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Create Account</Typography>

        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Full Name" margin="dense" value={full_name} onChange={(e) => setFullName(e.target.value)} required />
          <TextField fullWidth label="Email" type="email" margin="dense" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField fullWidth label="Password" type="password" margin="dense" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <TextField select fullWidth label="Role" margin="dense" value={role} onChange={(e) => setRole(e.target.value)} required>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="organizer">Organizer</MenuItem>
          </TextField>
          <TextField fullWidth label="Phone" margin="dense" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <TextField fullWidth label="Description / Status" margin="dense" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={3} />

          <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 2, backgroundColor: "#E76F51", "&:hover": { backgroundColor: "#D65A3C" } }}>
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Signup;
