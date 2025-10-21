import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Box, Typography } from "@mui/material";

const GET_USER_FAVORITES = gql`
  query userFavorites {
    userFavorites {
      id
      ngos {
        id
        name
        cause
      }
    }
  }
`;

const GET_ORGANIZER_FAVORITES = gql`
  query organizerFavorites {
    userFavorites {
      id
      ngos {
        id
        name
      }
    }
  }
`;

const FavoritesList = ({ organizer }) => {
  const { data, loading } = useQuery(organizer ? GET_ORGANIZER_FAVORITES : GET_USER_FAVORITES);

  if (loading) return <Typography>Loading favorites...</Typography>;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {organizer ? "Favorites" : "My Favorites"}
      </Typography>
      {data.userFavorites.map((fav) => (
        <Box key={fav.id} sx={{ p: 2, mb: 2, bgcolor: "#fff", borderRadius: 2 }}>
          <Typography variant="body2">{fav.ngos.name}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default FavoritesList;
