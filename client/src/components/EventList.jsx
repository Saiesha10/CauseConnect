import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Box, Typography } from "@mui/material";


const GET_EVENTS = gql`
  query events {
    events {
      id
      title
      description
      event_date
      location
      volunteers {
        id
        user_id
      }
    }
  }
`;

const EventList = ({ user }) => {
  const { data, loading } = useQuery(GET_EVENTS);

  if (loading) return <Typography>Loading events...</Typography>;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {user ? "My Volunteering Events" : "Events"}
      </Typography>
      {data.events.map((event) => (
        <Box key={event.id} sx={{ p: 2, mb: 2, bgcolor: "#fff", borderRadius: 2 }}>
          <Typography variant="body1">{event.title}</Typography>
          <Typography variant="body2">{event.description}</Typography>
          <Typography variant="body2">Date: {event.event_date}</Typography>
          <Typography variant="body2">Location: {event.location}</Typography>
          {user && <Typography variant="body2">Volunteers: {event.volunteers.length}</Typography>}
        </Box>
      ))}
    </Box>
  );
};

export default EventList;
