import React from "react";
import { gql, useQuery } from "@apollo/client";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Stack,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Container,
  keyframes,
} from "@mui/material";

export const GET_USER_DONATIONS = gql`
  query userDonations {
    userDonations {
      id
      amount
      message
      created_at
      ngo {
        id
        name
        contact_info
        ngo_picture
      }
    }
  }
`;

export const GET_ORGANIZER_DONATIONS = gql`
  query organizerDonations {
    organizerDonations {
      id
      amount
      message
      created_at
      user {
        id
        full_name
        email
        phone
        profile_picture
      }
      ngo {
        id
        name
        contact_info
        ngo_picture
      }
    }
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const parseDate = (timestamp) => {
  if (!timestamp) return "TBD";
  const d = new Date(Number(timestamp) || timestamp);
  return isNaN(d.getTime())
    ? "TBD"
    : d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

const DonationList = ({ isOrganizer = false }) => {
  const { data, loading, error } = useQuery(
    isOrganizer ? GET_ORGANIZER_DONATIONS : GET_USER_DONATIONS,
    {
      fetchPolicy: "cache-and-network",
      onError: (err) => console.error("GraphQL Error in DonationList:", err.message),
    }
  );

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress sx={{ color: "#E76F51" }} />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Alert severity="error">Failed to load donations. Please try again.</Alert>
      </Box>
    );

  const donations = data?.[isOrganizer ? "organizerDonations" : "userDonations"] || [];

  return (
    <Container sx={{ pt: 10, pb: 6 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: "#E76F51",
          textAlign: "center",
          mb: 4,
          animation: `${slideUp} 0.8s ease-out`,
        }}
      >
        {isOrganizer ? "Donations to My NGOs" : "My Donations"}
      </Typography>

      {donations.length === 0 ? (
        <Typography textAlign="center" color="#585858">
          No donations found.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {donations.map((donation) => (
            <Grid item xs={12} sm={6} md={4} key={donation.id}>
              <Card sx={{ borderRadius: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar
                        src={
                          isOrganizer
                            ? donation.user?.profile_picture || "/default-user.png"
                            : donation.ngo?.ngo_picture || "/default-ngo.png"
                        }
                        alt={
                          isOrganizer
                            ? donation.user?.full_name || "Anonymous Donor"
                            : donation.ngo?.name || "Unknown NGO"
                        }
                      />
                      <Typography fontWeight={700} color="#E76F51">
                        {isOrganizer
                          ? donation.user?.full_name || "Anonymous Donor"
                          : donation.ngo?.name || "Unknown NGO"}
                      </Typography>
                    </Box>

                    <Divider />

                    <Typography variant="body2">Amount: ₹{donation.amount}</Typography>
                    {donation.message && (
                      <Typography variant="body2" color="text.secondary">
                        Message: {donation.message}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      Date: {parseDate(donation.created_at)}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default DonationList;
