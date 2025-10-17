import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";


export const GET_NGO = gql`
  query getNGO($id: ID!) {
    ngo(id: $id) {
      id
      name
      cause
      description
      location
      contact_info
      donation_link
      ngo_picture
      events {
        id
        title
        event_date
      }
    }
  }
`;

const NGO_Details = () => {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);

  const { loading, error, data } = useQuery(GET_NGO, { variables: { id } });

  if (loading)
    return (
      <Typography sx={{ textAlign: "center", mt: 10 }}>
        Loading NGO details...
      </Typography>
    );
  if (error)
    return (
      <Typography sx={{ textAlign: "center", mt: 10, color: "red" }}>
        Error loading NGO details: {error.message}
      </Typography>
    );

  const ngo = data?.ngo;

  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh", pt: "80px" }}>
      <Container maxWidth="lg">
  
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: "'Work Sans', sans-serif",
              color: "#E76F51",
              fontWeight: 700,
              mb: 1,
            }}
          >
            {ngo.name}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Work Sans', sans-serif",
              color: "#333",
              fontWeight: 600,
            }}
          >
            Empowering communities through: {ngo.cause || "Social Work"}
          </Typography>
        </Box>


        <Box sx={{ width: "100%", mb: 4, position: "relative" }}>
          <Card sx={{ width: "100%", height: { xs: 300, sm: 450, md: 500 }, borderRadius: 2, boxShadow: 3, overflow: "hidden" }}>
            <CardMedia
              component="img"
              src={ngo.ngo_picture || "/default-ngo.png"}
              alt={ngo.name}
              sx={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
            />
     
            <IconButton
              onClick={() => setIsFavorite(!isFavorite)}
              sx={{
                position: "absolute",
                top: 20,
                right: 20,
                backgroundColor: "rgba(255,255,255,0.8)",
                "&:hover": { backgroundColor: "#fff" },
              }}
            >
              <FavoriteIcon sx={{ color: isFavorite ? "#E76F51" : "#999", fontSize: 28 }} />
            </IconButton>
          </Card>
        </Box>

        <Grid container spacing={4} sx={{ mb: 6 }}>
      
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 3, transition: "0.3s", "&:hover": { transform: "scale(1.02)" } }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 700, color: "#E76F51", mb: 2 }}>
                  About {ngo.name}
                </Typography>
                <Typography variant="body1" sx={{ color: "#333", fontFamily: "'Work Sans', sans-serif", fontWeight: 500, lineHeight: 1.6 }}>
                  {ngo.description || "No description available."}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: "'Work Sans', sans-serif", mb: 1 }}>
                  📍 Location: <span style={{ fontWeight: 500 }}>{ngo.location}</span>
                </Typography>

                {ngo.contact_info && (
                  <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: "'Work Sans', sans-serif", mb: 1 }}>
                    ☎️ Contact: <span style={{ fontWeight: 500 }}>{ngo.contact_info}</span>
                  </Typography>
                )}

             
                {ngo.cause && (
                  <Chip label={`Cause: ${ngo.cause}`} sx={{ backgroundColor: "#E76F51", color: "#fff", fontWeight: 600, mt: 1 }} />
                )}

              
                <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                  {ngo.donation_link && (
                    <Button
                      href={ngo.donation_link}
                      target="_blank"
                      variant="contained"
                      sx={{
                        backgroundColor: "#E76F51",
                        color: "#fff",
                        fontWeight: 700,
                        fontFamily: "'Work Sans', sans-serif",
                        textTransform: "none",
                        borderRadius: "8px",
                        py: 1.2,
                        "&:hover": { backgroundColor: "#D65A3C" },
                      }}
                    >
                      Donate Now!
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    sx={{
                      borderColor: "#E76F51",
                      color: "#E76F51",
                      fontWeight: 700,
                      fontFamily: "'Work Sans', sans-serif",
                      textTransform: "none",
                      borderRadius: "8px",
                      py: 1.2,
                      "&:hover": { backgroundColor: "#FDEDE6", borderColor: "#D65A3C", color: "#D65A3C" },
                    }}
                  >
                    Volunteer
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 700, color: "#E76F51", mb: 2 }}>
              Events by {ngo.name}
            </Typography>

            {ngo.events.length > 0 ? (
              ngo.events.map((event) => (
                <Card key={event.id} sx={{ mb: 3, borderRadius: 2, boxShadow: 3, transition: "0.3s", "&:hover": { transform: "scale(1.03)" } }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Work Sans', sans-serif", mb: 1 }}>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#555", fontFamily: "'Work Sans', sans-serif" }}>
                      Date: {new Date(event.event_date).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography variant="body1" sx={{ color: "#555", fontFamily: "'Work Sans', sans-serif" }}>
                No events found for this NGO.
              </Typography>
            )}
          </Grid>
        </Grid>

        <Card sx={{ p: 3, borderRadius: 2, boxShadow: 3, textAlign: "center", mb: 6 }}>
          <Typography variant="h6" sx={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 700, color: "#E76F51", mb: 1 }}>
            Comments Section
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: "'Work Sans', sans-serif", color: "#333", fontWeight: 500 }}>
            Comments feature !
          </Typography>
        </Card>
      </Container>
    </Box>
  );
};

export default NGO_Details;
