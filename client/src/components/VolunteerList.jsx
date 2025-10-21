import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Box, Typography } from "@mui/material";

const GET_ORGANIZER_VOLUNTEERS = gql`
  query organizerVolunteers {
    organizerVolunteers {
      id
      user {
        id
        full_name
      }
      event {
        id
        title
      }
      registered_at
    }
  }
`;

const VolunteerList = () => {
  const { data, loading } = useQuery(GET_ORGANIZER_VOLUNTEERS);

  if (loading) return <Typography>Loading volunteers...</Typography>;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Volunteers
      </Typography>
      {data.organizerVolunteers.map((vol) => (
        <Box key={vol.id} sx={{ p: 2, mb: 2, bgcolor: "#fff", borderRadius: 2 }}>
          <Typography variant="body2">
            {vol.user.full_name} volunteered for {vol.event.title} on {vol.registered_at}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default VolunteerList;
