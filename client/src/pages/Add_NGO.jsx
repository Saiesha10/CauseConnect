import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../utils/cloudinary";

const CREATE_NGO = gql`
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
      ngo_picture
    }
  }
`;

const Add_NGO = () => {
  const [name, setName] = useState("");
  const [cause, setCause] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [donationLink, setDonationLink] = useState("");
  const [ngoPicture, setNgoPicture] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const [createNGO, { loading }] = useMutation(CREATE_NGO, {
    onCompleted: (data) => {
      navigate(`/ngo/${data.createNGO.id}`);
    },
    onError: (err) => setErrorMsg(err.message),
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadToCloudinary(file);
      setNgoPicture(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createNGO({
      variables: {
        name,
        cause,
        description,
        location,
        contact_info: contactInfo,
        donation_link: donationLink,
        ngo_picture: ngoPicture,
      },
    });
  };

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        minHeight: "100vh",
        pt: "100px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: { xs: "90%", sm: "500px" },
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Typography
          variant="h4"
          mb={2}
          sx={{
            fontFamily: "'Work Sans', sans-serif",
            fontWeight: 600,
            color: "#E76F51",
            textAlign: "center",
          }}
        >
          Add New NGO
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="NGO Name"
            margin="dense"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Cause"
            margin="dense"
            value={cause}
            onChange={(e) => setCause(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Description"
            margin="dense"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Location"
            margin="dense"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Contact Info"
            margin="dense"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
          />
          <TextField
            fullWidth
            label="Donation Link"
            margin="dense"
            value={donationLink}
            onChange={(e) => setDonationLink(e.target.value)}
          />

          <Button
            variant="contained"
            component="label"
            sx={{
              mt: 2,
              backgroundColor: "#E76F51",
              fontFamily: "'Work Sans', sans-serif",
              "&:hover": { backgroundColor: "#D65A3C" },
            }}
          >
            Upload Picture
            <input type="file" hidden onChange={handleImageUpload} />
          </Button>

          {ngoPicture && (
            <Typography
              variant="body2"
              mt={1}
              sx={{ color: "#333", wordBreak: "break-all" }}
            >
              Uploaded: {ngoPicture}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              py: 1.2,
              fontWeight: 700,
              backgroundColor: "#E76F51",
              fontFamily: "'Work Sans', sans-serif",
              "&:hover": { backgroundColor: "#D65A3C" },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Add NGO"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Add_NGO;
