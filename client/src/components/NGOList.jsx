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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../utils/cloudinary";

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
      ngo_picture
    }
  }
`;

const NGOList = () => {
  const navigate = useNavigate();
  const { data, loading, refetch } = useQuery(GET_ORGANIZER_NGOS);
  const [updateNGO, { loading: updating }] = useMutation(UPDATE_NGO, {
    onCompleted: () => {
      alert("NGO updated successfully!");
      refetch();
      setEditingId(null);
    },
    onError: (err) => alert(err.message),
  });

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  const handleEditClick = (ngo) => {
    setEditingId(ngo.id);
    setFormData({
      name: ngo.name,
      cause: ngo.cause,
      description: ngo.description,
      location: ngo.location,
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
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, ngo_picture: url }));
    } catch (err) {
      console.error(err);
      alert("Image upload failed!");
    }
  };

  const handleUpdate = () => {
    updateNGO({ variables: { id: editingId, ...formData } });
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {data.organizerNGOs.map((ngo) => (
        <Paper
          key={ngo.id}
          elevation={3}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            bgcolor: "#fff",
          }}
        >
          {editingId === ngo.id ? (
            <>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
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
                <Button variant="contained" component="label" sx={{ backgroundColor: "#E76F51" }}>
                  Upload Picture
                  <input type="file" hidden onChange={handleImageUpload} />
                </Button>
              </Box>

              <TextField
                fullWidth
                name="name"
                label="NGO Name"
                value={formData.name}
                onChange={handleInputChange}
                margin="dense"
              />
              <TextField
                fullWidth
                name="cause"
                label="Cause"
                value={formData.cause}
                onChange={handleInputChange}
                margin="dense"
              />
              <TextField
                fullWidth
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                margin="dense"
              />
              <TextField
                fullWidth
                name="location"
                label="Location"
                value={formData.location}
                onChange={handleInputChange}
                margin="dense"
              />
              <TextField
                fullWidth
                name="contact_info"
                label="Contact Info"
                value={formData.contact_info}
                onChange={handleInputChange}
                margin="dense"
              />
              <TextField
                fullWidth
                name="donation_link"
                label="Donation Link"
                value={formData.donation_link}
                onChange={handleInputChange}
                margin="dense"
              />

              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: "#4caf50" }}
                  onClick={handleUpdate}
                  disabled={updating}
                >
                  {updating ? <CircularProgress size={20} /> : "Update"}
                </Button>
                <Button variant="outlined" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Avatar
                  src={ngo.ngo_picture}
                  sx={{
                    width: 80,
                    height: 80,
                    mr: 2,
                    bgcolor: "#FFE5D9",
                    border: "2px solid #E76F51",
                  }}
                />
                <Typography variant="h6">{ngo.name}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {ngo.cause}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {ngo.description}
              </Typography>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: "#E76F51" }}
                  onClick={() => handleEditClick(ngo)}
                >
                  Edit
                </Button>

                <Button
                  variant="outlined"
                  sx={{ borderColor: "#E76F51", color: "#E76F51" }}
                  onClick={() => navigate(`/dashboard/events/create/${ngo.id}`)}
                >
                  Create Event
                </Button>
              </Box>
            </>
          )}
        </Paper>
      ))}
    </Box>
  );
};

export default NGOList;
