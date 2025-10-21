import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { Box, TextField, Button, Alert, CircularProgress, Typography } from "@mui/material";

const UPDATE_USER = gql`
  mutation updateUser($id: ID!, $full_name: String, $profile_picture: String) {
    updateUser(id: $id, full_name: $full_name, profile_picture: $profile_picture) {
      id
      full_name
      profile_picture
    }
  }
`;

const ProfileSection = ({ userId }) => {
  const [fullName, setFullName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [updateUser, { loading }] = useMutation(UPDATE_USER, {
    onError: (err) => setErrorMsg(err.message),
    onCompleted: () => alert("Profile updated successfully!"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser({ variables: { id: userId, full_name: fullName, profile_picture: profilePic } });
  };

  return (
    <Box sx={{ mb: 4, p: 3, bgcolor: "#fff", borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Profile
      </Typography>
      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          margin="dense"
        />
        <TextField
          fullWidth
          label="Profile Picture URL"
          value={profilePic}
          onChange={(e) => setProfilePic(e.target.value)}
          margin="dense"
        />
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2, backgroundColor: "#E76F51", "&:hover": { backgroundColor: "#D65A3C" } }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Update Profile"}
        </Button>
      </form>
    </Box>
  );
};

export default ProfileSection;
