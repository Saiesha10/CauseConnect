import React, { useState, useEffect } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
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
      location
      contact_info
      donation_link
      ngo_picture
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


const GET_NGO_BY_ID = gql`
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

  const [formData, setFormData] = useState({
    name: "",
    cause: "",
    description: "",
    location: "",
    contact_info: "",
    donation_link: "",
    ngo_picture: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();


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
    onCompleted: (data) => navigate(`/ngo/${data.createNGO.id}`),
    onError: (err) => setErrorMsg(err.message),
  });

  const [updateNGO, { loading: updating }] = useMutation(UPDATE_NGO, {
    onCompleted: (data) => navigate(`/ngo/${data.updateNGO.id}`),
    onError: (err) => setErrorMsg(err.message),
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, ngo_picture: url }));
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to upload image.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateNGO({ variables: { id, ...formData } });
    } else {
      createNGO({ variables: formData });
    }
  };

  if (loadingNGO)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

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
          {isEditing ? "Edit NGO Details" : "Add New NGO"}
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { label: "NGO Name", name: "name", required: true },
            { label: "Cause", name: "cause", required: true },
            {
              label: "Description",
              name: "description",
              multiline: true,
              rows: 3,
              required: true,
            },
            { label: "Location", name: "location", required: true },
            { label: "Contact Info", name: "contact_info" },
            { label: "Donation Link", name: "donation_link" },
          ].map((field) => (
            <TextField
              key={field.name}
              fullWidth
              margin="dense"
              {...field}
              value={formData[field.name]}
              onChange={handleChange}
            />
          ))}

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

          {formData.ngo_picture && (
            <Typography
              variant="body2"
              mt={1}
              sx={{ color: "#333", wordBreak: "break-all" }}
            >
              Uploaded: {formData.ngo_picture}
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
            disabled={creating || updating}
          >
            {(creating || updating) ? (
              <CircularProgress size={24} color="inherit" />
            ) : isEditing ? (
              "Update NGO"
            ) : (
              "Add NGO"
            )}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Add_NGO;
