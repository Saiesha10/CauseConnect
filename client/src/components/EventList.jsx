import React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Box, Typography, Button } from "@mui/material";

const GET_EVENTS = gql`
  query events($organizerId: ID) {
    events(organizerId: $organizerId) {
      id
      title
      description
      event_date
      location
      volunteers_needed
      volunteers {
        user_id
      }
    }
  }
`;

const VOLUNTEER_EVENT = gql`
  mutation volunteerEvent($eventId: ID!) {
    volunteerEvent(eventId: $eventId) {
      id
      user_id
    }
  }
`;

const EventList = ({ user, organizer = false, userId }) => {
  const { data, loading, error, refetch } = useQuery(GET_EVENTS, {
    variables: { organizerId: organizer ? userId : null },
    fetchPolicy: "cache-and-network",
  });

  const [volunteerEvent, { loading: volunteering }] = useMutation(VOLUNTEER_EVENT, {
    onCompleted: () => refetch(),
  });

  const isRegistered = (event) => {
    if (!user) return false;
    return event.volunteers.some((v) => v.user_id === user.id);
  };

  const handleVolunteer = (eventId) => {
    volunteerEvent({ variables: { eventId } });
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error.message}</Typography>;

  return (
    <Box>
      {data.events.map((event) => (
        <Box key={event.id} sx={{ p: 2, mb: 2, bgcolor: "#fff", borderRadius: 2 }}>
          <Typography variant="h6">{event.title}</Typography>
          <Typography variant="body2">{event.description}</Typography>
          <Typography variant="body2">
            Date: {event.event_date ? new Date(event.event_date).toLocaleDateString() : "TBD"}
          </Typography>
          <Typography variant="body2">Location: {event.location}</Typography>
          <Typography variant="body2">
            Volunteers: {event.volunteers.length}/{event.volunteers_needed || "-"}
          </Typography>
          {!organizer && (
            <Button
              variant="contained"
              sx={{ mt: 1, backgroundColor: isRegistered(event) ? "#2E7D32" : "#E76F51" }}
              onClick={() => handleVolunteer(event.id)}
              disabled={isRegistered(event) || volunteering}
            >
              {isRegistered(event) ? "Registered ✅" : volunteering ? "Processing..." : "Volunteer"}
            </Button>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default EventList;
