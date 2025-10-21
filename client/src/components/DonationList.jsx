import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Box, Typography } from "@mui/material";

const GET_USER_DONATIONS = gql`
  query userDonations {
    userDonations {
      id
      amount
      ngos {
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
      ngos {
        id
        name
      }
    }
  }
`;

const DonationList = ({ organizer }) => {
  const { data, loading } = useQuery(organizer ? GET_ORGANIZER_DONATIONS : GET_USER_DONATIONS);

  if (loading) return <Typography>Loading donations...</Typography>;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {organizer ? "Donations to My NGOs" : "My Donations"}
      </Typography>
      {data[organizer ? "organizerDonations" : "userDonations"].map((donation) => (
        <Box key={donation.id} sx={{ p: 2, mb: 2, bgcolor: "#fff", borderRadius: 2 }}>
          {organizer ? (
            <Typography variant="body2">
              {donation.user.full_name} donated {donation.amount} to {donation.ngos.name}
            </Typography>
          ) : (
            <Typography variant="body2">
              Donated {donation.amount} to {donation.ngos.name}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default DonationList;
