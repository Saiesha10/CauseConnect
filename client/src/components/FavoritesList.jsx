import React from "react"; 
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";


const GET_USER_FAVORITES = gql`
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

const REMOVE_FAVORITE = gql`
  mutation RemoveFavorite($ngo_id: ID!) {
    removeFavorite(ngo_id: $ngo_id)
  }
`;


const FavoritesList = () => {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(GET_USER_FAVORITES);
  const [removeFavorite] = useMutation(REMOVE_FAVORITE);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleRemoveFavorite = async (ngoId) => {
    try {
      await removeFavorite({ variables: { ngo_id: ngoId } });
      setSnackbar({
        open: true,
        message: "Removed from favorites successfully.",
        severity: "success",
      });
      await refetch();
    } catch (err) {
      console.error("Error removing favorite:", err);
      setSnackbar({
        open: true,
        message: "Failed to remove favorite. Please try again.",
        severity: "error",
      });
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress sx={{ color: "#E76F51" }} />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" align="center" mt={5}>
        Failed to load favorites. Please try again later.
      </Typography>
    );

  const favorites = data?.userFavorites || [];

  if (favorites.length === 0)
    return (
      <Typography align="center" mt={5} color="text.secondary">
        You have not added any favorites yet.
      </Typography>
    );

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        backgroundColor: "#FAFAFA",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 600,
          textAlign: "center",
          color: "#264653",
          letterSpacing: 0.5,
        }}
      >
        My Favorite NGOs
      </Typography>

      <Grid container spacing={2}>
        {favorites.map((fav) => {
          const ngo = fav.ngo;
          if (!ngo) return null;

          return (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={ngo.id}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Card
                sx={{
                  width: 1200,
                  height: 310,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderRadius: 3,
                  boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                  position: "relative",
                  cursor: "pointer",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
                  },
                }}
                onClick={() => navigate(`/ngo/${ngo.id}`)}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={
                    ngo.ngo_picture ||
                    "https://res.cloudinary.com/demo/image/upload/v1690000000/default_ngo.jpg"
                  }
                  alt={ngo.name}
                  sx={{
                    objectFit: "cover",
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                  }}
                />

                <CardContent
                  sx={{
                    flexGrow: 1,
                    p: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: "#2A9D8F",
                        mb: 0.5,
                        fontSize: "0.95rem",
                        textAlign: "center",
                      }}
                    >
                      {ngo.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 0.5,
                        textTransform: "capitalize",
                        fontSize: "0.8rem",
                        textAlign: "center",
                      }}
                    >
                      {ngo.cause}
                    </Typography>

                    {ngo.location && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5, fontSize: "0.75rem", textAlign: "center" }}
                      >
                        📍 {ngo.location}
                      </Typography>
                    )}

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        fontSize: "0.75rem",
                        textAlign: "center",
                      }}
                    >
                      {ngo.description || "No description available."}
                    </Typography>
                  </Box>

                  {/* BUTTONS */}
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1,
                    }}
                  >
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#E76F51",
                        color: "#fff",
                        textTransform: "none",
                        borderRadius: 2,
                        fontSize: "0.7rem",
                        "&:hover": { backgroundColor: "#D65A3C" },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/ngo/${ngo.id}`);
                      }}
                    >
                      View
                    </Button>

                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: "#E76F51",
                        color: "#E76F51",
                        textTransform: "none",
                        borderRadius: 2,
                        fontSize: "0.7rem",
                        "&:hover": {
                          borderColor: "#D65A3C",
                          color: "#D65A3C",
                        },
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

      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FavoritesList;
