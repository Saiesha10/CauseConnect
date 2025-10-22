import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Box, Typography } from "@mui/material";


const GET_USER_FAVORITES = gql`
  query userFavorites {
    userFavorites {
      id
      ngo{
        id
        name
        cause
      }
    }
  }
`;

const GET_ORGANIZER_FAVORITES = gql`
  query organizerFavorites {
  organizerFavorites {
    id
    user {
      id
      full_name
    }
    ngo {
      id
      name
      cause
    }
  }
}

`;


const FavoritesList = ({ organizer = false }) => {
  const { data, loading, error } = useQuery(
    organizer ? GET_ORGANIZER_FAVORITES : GET_USER_FAVORITES
  );

  if (loading) return <Typography>Loading favorites...</Typography>;
  if (error) return <Typography color="error">Failed to load favorites.</Typography>;


  const favorites = data?.[organizer ? "organizerFavorites" : "userFavorites"] || [];

  if (favorites.length === 0)
    return <Typography>No favorites found.</Typography>;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {organizer ? "Favorites" : "My Favorites"}
      </Typography>

      {favorites.map((fav) =>
        fav.ngos.map((ngo) => (
          <Box
            key={ngo.id}
            sx={{ p: 2, mb: 2, bgcolor: "#fff", borderRadius: 2, boxShadow: 1 }}
          >
            <Typography variant="body2">{ngo.name} - {ngo.cause}</Typography>
          </Box>
        ))
      )}
    </Box>
  );
};

export default FavoritesList;
