import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DescriptionIcon from "@mui/icons-material/Description";


export const GET_USER_FAVORITES = gql`
  query GetUserFavorites {
    userFavorites {
      id
      ngo {
        id
        name
        cause
        location
        ngo_picture
        description
      }
    }
  }
`;

export const REMOVE_FAVORITE = gql`
  mutation RemoveFavorite($ngo_id: ID!) {
    removeFavorite(ngo_id: $ngo_id)
  }
`;

const navButtonStyle = {
  bgcolor: "#E76F51",
  color: "#fff",
  fontWeight: 700,
  textTransform: "none",
  fontFamily: "'Work Sans', sans-serif",
  borderRadius: "12px",
  px: { xs: 1.5, sm: 2 },
  py: 1,
  transition: "all 0.3s ease",
  "&:hover": {
    bgcolor: "#D65A3C",
    transform: "scale(1.05)",
    boxShadow: "0 6px 20px rgba(231, 111, 81, 0.4)",
  },
  "&:disabled": {
    bgcolor: "#B0BEC5",
    color: "#fff",
  },
};

const FavoritesList = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_USER_FAVORITES, {
    fetchPolicy: "cache-and-network",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });


  const [removeFavorite] = useMutation(REMOVE_FAVORITE, {
    update(cache, { data: mutationData, variables }) {
      try {
        const existing = cache.readQuery({ query: GET_USER_FAVORITES });
        if (!existing || !existing.userFavorites) return;

        const updatedFavorites = existing.userFavorites.filter(
          (fav) => fav.ngo.id !== variables.ngo_id
        );

        cache.writeQuery({
          query: GET_USER_FAVORITES,
          data: { userFavorites: updatedFavorites },
        });
      } catch (err) {
        console.warn("Cache update skipped:", err);
      }
    },
    onCompleted: () => {
      setSnackbar({
        open: true,
        message: "Removed from favorites successfully.",
        severity: "success",
      });
    },
    onError: (err) => {
      console.error("Remove favorite error:", err);
      setSnackbar({
        open: true,
        message: "Failed to remove favorite. Please try again.",
        severity: "error",
      });
    },
  });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleRemoveFavorite = async (ngoId) => {
    try {
      await removeFavorite({ variables: { ngo_id: ngoId } });
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress sx={{ color: "#E76F51" }} />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load favorites. Please try again.
        </Alert>
      </Box>
    );

  const favorites = data?.userFavorites || [];

  return (
    <Box sx={{ bgcolor: "#FDFCFB", minHeight: "100vh", pt: { xs: 10, sm: 12 }, pb: 6 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Work Sans', sans-serif",
            fontWeight: 700,
            color: "#E76F51",
            textAlign: "center",
            mb: 4,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
          }}
        >
          My Favorite NGOs
        </Typography>

        {favorites.length === 0 ? (
          <Typography sx={{ textAlign: "center", color: "#585858", fontFamily: "'Work Sans', sans-serif" }}>
            You have not added any favorites yet.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {favorites.map((fav) => {
              const ngo = fav.ngo;
              if (!ngo) return null;

              return (
                <Grid item xs={12} sm={6} md={4} key={ngo.id}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.3s ease",
                      "&:hover": { transform: "translateY(-6px)" },
                      bgcolor: "#FFF3EF",
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={ngo.ngo_picture || "https://res.cloudinary.com/demo/image/upload/v1690000000/default_ngo.jpg"}
                      alt={ngo.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          textAlign: "center",
                          color: "#E76F51",
                          fontWeight: 700,
                          fontFamily: "'Work Sans', sans-serif",
                        }}
                      >
                        {ngo.name}
                      </Typography>
                      <Typography sx={{ textAlign: "center", color: "#585858" }}>
                        <strong>Cause:</strong> {ngo.cause || "N/A"}
                      </Typography>
                      {ngo.location && (
                        <Typography
                          sx={{
                            textAlign: "center",
                            color: "#585858",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.5,
                          }}
                        >
                          <LocationOnIcon sx={{ fontSize: "1rem" }} /> {ngo.location}
                        </Typography>
                      )}
                      <Typography
                        sx={{
                          textAlign: "center",
                          color: "#585858",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        <DescriptionIcon sx={{ fontSize: "1rem", verticalAlign: "middle", mr: 0.5 }} />
                        {ngo.description || "No description available."}
                      </Typography>

                      <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 1 }}>
                        <Button
                          variant="contained"
                          sx={navButtonStyle}
                          startIcon={<FavoriteIcon />}
                          onClick={() => navigate(`/ngo/${ngo.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outlined"
                          sx={{
                            ...navButtonStyle,
                            bgcolor: "#fff",
                            color: "#C62828",
                            border: "1px solid #C62828",
                            "&:hover": { bgcolor: "#FFEBEE" },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFavorite(ngo.id);
                          }}
                        >
                          Remove
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default FavoritesList;
