import React, { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Box, Typography, Avatar, TextField, Button, Alert, CircularProgress } from "@mui/material";
import { uploadToCloudinary } from "../utils/cloudinary";

const GET_USER = gql`
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

const UPDATE_USER = gql`
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
  const [fullName, setFullName] = useState("");
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewPic, setPreviewPic] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { data, loading: userLoading, error: userError } = useQuery(GET_USER, { variables: { id: userId }, skip: !userId });

  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER, {
    onError: (err) => setErrorMsg(err.message),
    onCompleted: () => {
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    },
    refetchQueries: [{ query: GET_USER, variables: { id: userId } }],
  });

  useEffect(() => {
    if (data?.user) {
      setFullName(data.user.full_name || "");
      setPreviewPic(data.user.profile_picture || "");
      setEmail(data.user.email || "");
      setPhone(data.user.phone || "");
      setDescription(data.user.description || "");
    }
  }, [data]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setPreviewPic(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!userId) {
      setErrorMsg("User ID is missing.");
      return;
    }

    let profilePicUrl = previewPic;
    if (profilePicFile) {
      try {
        profilePicUrl = await uploadToCloudinary(profilePicFile);
      } catch {
        setErrorMsg("Failed to upload profile picture.");
        return;
      }
    }

    updateUser({
      variables: { id: userId, full_name: fullName, profile_picture: profilePicUrl, email, phone, description },
    });
  };

  if (userLoading) return <Typography>Loading profile...</Typography>;
  if (userError) return <Alert severity="error">{userError.message}</Alert>;

  return (
    <Box sx={{ p: 4, bgcolor: "#fff", borderRadius: 2, maxWidth: 600, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Avatar src={previewPic} alt={fullName} sx={{ width: 100, height: 100, mr: 3 }} />
        <Box>
          <Typography variant="h5">{fullName || "No Name"}</Typography>
          <Typography variant="body2" color="text.secondary">Role: {data?.user?.role || "N/A"}</Typography>
          <Typography variant="body2" color="text.secondary">Status: {description || "No status set"}</Typography>
        </Box>
      </Box>

      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} margin="dense" />
        <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} margin="dense" />
        <TextField fullWidth label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} margin="dense" />
        <TextField fullWidth label="Description / Status" value={description} onChange={(e) => setDescription(e.target.value)} margin="dense" multiline rows={3} />

        <Button variant="outlined" component="label" sx={{ mt: 2 }}>
          Upload Profile Picture
          <input type="file" hidden accept="image/*" onChange={handleImageChange} />
        </Button>

        <Button type="submit" variant="contained" sx={{ mt: 2, ml: 2, backgroundColor: "#E76F51", "&:hover": { backgroundColor: "#D65A3C" } }} disabled={updateLoading || !userId}>
          {updateLoading ? <CircularProgress size={24} color="inherit" /> : "Update Profile"}
        </Button>
      </form>
    </Box>
  );
};

export default ProfileSection;
