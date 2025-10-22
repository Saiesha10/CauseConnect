import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useMutation, gql } from "@apollo/client";
import { useParams } from "react-router-dom";

const CREATE_EVENT = gql`
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
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    volunteers_needed: "",
  });

  const [createEvent, { loading, error }] = useMutation(CREATE_EVENT, {
    onCompleted: (data) => {
      if (onEventCreated) onEventCreated(data.createEvent);
      setFormData({
        title: "",
        description: "",
        event_date: "",
        location: "",
        volunteers_needed: "",
      });
      alert("Event created successfully!");
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createEvent({
      variables: {
        ngo_id: ngoId, 
        title: formData.title,
        description: formData.description || null,
        event_date: formData.event_date || null,
        location: formData.location || null,
        volunteers_needed: formData.volunteers_needed
          ? parseInt(formData.volunteers_needed)
          : null,
      },
    });
  };

  return (
    <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, boxShadow: 1, maxWidth: 500, mx: "auto", mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Create New Event
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          name="title"
          fullWidth
          required
          value={formData.title}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Description"
          name="description"
          fullWidth
          multiline
          rows={3}
          value={formData.description}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Date"
          name="event_date"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={formData.event_date}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Location"
          name="location"
          fullWidth
          value={formData.location}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Volunteers Needed"
          name="volunteers_needed"
          type="number"
          fullWidth
          value={formData.volunteers_needed}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        {error && (
          <Typography color="error" sx={{ mb: 1 }}>
            {error.message}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          sx={{ backgroundColor: "#E76F51", "&:hover": { backgroundColor: "#D65A3C" } }}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Event"}
        </Button>
      </form>
    </Box>
  );
};

export default CreateEvent;
