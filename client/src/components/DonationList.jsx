import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Box, Typography, Card, CardContent, Grid, Divider, Stack, Chip, Avatar } from "@mui/material";

// GraphQL queries
const GET_USER_DONATIONS = gql`
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

const GET_ORGANIZER_DONATIONS = gql`
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


const parseDate = (timestamp) => {
  if (!timestamp) return "TBD";
  const d = new Date(Number(timestamp) || timestamp);
  return isNaN(d.getTime())
    ? "TBD"
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const DonationList = ({ organizer = false }) => {
  const { data, loading, error } = useQuery(
    organizer ? GET_ORGANIZER_DONATIONS : GET_USER_DONATIONS,
    {
      fetchPolicy: "cache-and-network",
      onError: (err) => console.error("GraphQL Error in DonationList:", err.message),
    }
  );

  if (loading) return <Typography>Loading donations...</Typography>;
  if (error) return <Typography color="error">Failed to load donations. Please log in again.</Typography>;

  const donations = data?.[organizer ? "organizerDonations" : "userDonations"] || [];
  if (donations.length === 0) return <Typography>No donations found.</Typography>;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: "#E76F51" }}>
        {organizer ? "Donations to My NGOs" : "My Donations"}
      </Typography>

      <Grid container spacing={3}>
        {donations.map((donation) => {
          const displayName = organizer
            ? donation.user?.full_name || "Anonymous Donor"
            : donation.ngo?.name || "Unknown NGO";

          const contactInfo = organizer
            ? donation.user?.email || donation.user?.phone
            : donation.ngo?.contact_info || "N/A";

          const profilePic = organizer
            ? donation.user?.profile_picture
            : donation.ngo?.ngo_picture || "/default-ngo.png";

          return (
            <Grid item xs={12} sm={6} md={4} key={donation.id}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: 3,
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 6,
                    borderColor: "#E76F51",
                  },
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    {/* Profile Picture + Name */}
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar
                        src={profilePic}
                        alt={displayName}
                        sx={{ width: 48, height: 48, bgcolor: "#E76F51" }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#E76F51" }}>
                        {displayName}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Amount */}
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#555" }}>Amount:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>₹{donation.amount}</Typography>
                    </Box>

                    {/* Message */}
                    {donation.message && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#555" }}>Message:</Typography>
                        <Typography variant="body2" sx={{ fontStyle: "italic", color: "#555" }}>{donation.message}</Typography>
                      </Box>
                    )}

                    {/* Chips */}
                    <Box>
                      {donation.message && <Chip label="Message included" size="small" color="primary" sx={{ mr: 1, mt: 0.5 }} />}
                      {organizer && !donation.user?.full_name && <Chip label="Anonymous Donor" size="small" color="secondary" sx={{ mt: 0.5 }} />}
                    </Box>

                    {/* Details */}
                    {organizer ? (
                      <>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#555" }}>Email:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{donation.user?.email || "N/A"}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#555" }}>Phone:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{donation.user?.phone || "N/A"}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#555" }}>NGO:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{donation.ngo?.name || "Unknown NGO"}</Typography>
                        </Box>
                      </>
                    ) : (
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#555" }}>NGO Contact:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{donation.ngo?.contact_info || "N/A"}</Typography>
                      </Box>
                    )}

                    {/* Date */}
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#555" }}>Date:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{parseDate(donation.created_at)}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default DonationList;
