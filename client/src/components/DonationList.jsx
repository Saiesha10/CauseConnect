import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Box, Typography } from "@mui/material";


const GET_USER_DONATIONS = gql`
  query userDonations {
    userDonations {
      id
      amount
      ngo {
        id
        name
      }
    }
  }
`;

const GET_ORGANIZER_DONATIONS = gql`
  query organizerDonations {
    organizerDonations {
      id
      amount
      user {
        id
        full_name
      }
      ngo {
        id
        name
      }
    }
  }
`;


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

  if (donations.length === 0)
    return <Typography>No donations found.</Typography>;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {organizer ? "Donations to My NGOs" : "My Donations"}
      </Typography>

      {donations.map((donation) => (
        <Box
          key={donation.id}
          sx={{
            p: 2,
            mb: 2,
            bgcolor: "#fff",
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          {organizer ? (
            <Typography variant="body2">
              {donation.user?.full_name
                ? `${donation.user.full_name} donated ₹${donation.amount} to ${donation.ngo?.name || "Unknown NGO"}`
                : `Donation of ₹${donation.amount} to ${donation.ngo?.name || "Unknown NGO"}`}
            </Typography>
          ) : (
            <Typography variant="body2">
              Donated ₹{donation.amount} to {donation.ngo?.name || "Unknown NGO"}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default DonationList;
