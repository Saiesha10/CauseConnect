import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  keyframes,
} from "@mui/material";
import { gql, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";

export const GET_ALL_NGOS = gql`
  query ngos {
    ngos {
      id
      name
      cause
      description
      location
      ngo_picture
      created_at
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

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
`;

const NGO_Listings = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_ALL_NGOS);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [filterLocation, setFilterLocation] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredNgos = useMemo(() => {
    if (!data?.ngos) return [];
    let ngos = [...data.ngos];

    if (search.trim()) {
      ngos = ngos.filter((ngo) =>
        ngo.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterLocation.trim()) {
      ngos = ngos.filter((ngo) =>
        ngo.location.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }

    ngos.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return sort === "latest" ? dateB - dateA : dateA - dateB;
    });

    return ngos;
  }, [data, search, sort, filterLocation]);

  const visibleNgos = filteredNgos.slice(0, visibleCount);

  const navButtonStyle = {
    bgcolor: "#E76F51",
    color: "#fff",
    fontWeight: 700,
    textTransform: "none",
    fontFamily: "'Work Sans', sans-serif",
    borderRadius: "12px",
    px: { xs: 2.5, sm: 3 },
    py: 1.2,
    transition: "all 0.3s ease",
    "&:hover": {
      bgcolor: "#D65A3C",
      transform: "scale(1.05)",
      boxShadow: "0 6px 20px rgba(231, 111, 81, 0.4)",
    },
  };

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 6);
  }, []);

  if (loading)
    return (
      <Typography
        sx={{
          textAlign: "center",
          mt: { xs: 8, sm: 10 },
          fontFamily: "'Work Sans', sans-serif",
          color: "#E76F51",
          fontSize: { xs: "1.2rem", sm: "1.5rem" },
          animation: `${fadeIn} 0.8s ease-out`,
        }}
        aria-live="polite"
      >
        Loading NGOs...
      </Typography>
    );
  if (error)
    return (
      <Typography
        sx={{
          textAlign: "center",
          mt: { xs: 8, sm: 10 },
          color: "#E76F51",
          fontFamily: "'Work Sans', sans-serif",
          fontSize: { xs: "1.2rem", sm: "1.5rem" },
          animation: `${fadeIn} 0.8s ease-out`,
        }}
        aria-live="assertive"
      >
        Error: {error.message}
      </Typography>
    );

  return (
    <Box
      sx={{
        bgcolor: "linear-gradient(135deg, #FDFCFB 0%, #F5F5F5 100%)",
        minHeight: "100vh",
        py: { xs: 4, sm: 6, md: 8 },
        px: { xs: 2, sm: 3, md: 4 },
        animation: `${fadeIn} 1s ease-out`,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          textAlign: "center",
          mb: { xs: 3, sm: 4, md: 5 },
          color: "#E76F51", // Matches button color
          fontFamily: "'Work Sans', sans-serif",
          fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.8rem", lg: "3rem" },
          textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          animation: `${slideUp} 0.8s ease-out 0.2s backwards`,
        }}
      >
        Explore NGOs Making an Impact 🌍
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: { xs: 1.5, sm: 2 },
          mb: { xs: 3, sm: 4, md: 5 },
          p: { xs: 2, sm: 3 },
          bgcolor: "#fff",
          borderRadius: 4,
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          animation: `${slideUp} 0.8s ease-out 0.4s backwards`,
          transition: "transform 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 25px rgba(231, 111, 81, 0.2)",
          },
        }}
      >
        <TextField
          label="Search NGOs"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            minWidth: { xs: "100%", sm: 260 },
            bgcolor: "#F9FAFB",
            borderRadius: "12px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              "&:hover fieldset": { borderColor: "#E76F51" },
              "&.Mui-focused fieldset": { borderColor: "#E76F51" },
            },
            "& .MuiInputLabel-root": {
              color: "#585858",
              "&.Mui-focused": { color: "#E76F51" },
            },
            "& .MuiInputBase-input": {
              fontFamily: "'Work Sans', sans-serif",
            },
          }}
          InputLabelProps={{
            sx: { fontFamily: "'Work Sans', sans-serif" },
          }}
          inputProps={{ "aria-label": "Search NGOs by name" }}
        />
        <TextField
          label="Filter by Location"
          variant="outlined"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          sx={{
            minWidth: { xs: "100%", sm: 260 },
            bgcolor: "#F9FAFB",
            borderRadius: "12px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              "&:hover fieldset": { borderColor: "#E76F51" },
              "&.Mui-focused fieldset": { borderColor: "#E76F51" },
            },
            "& .MuiInputLabel-root": {
              color: "#585858",
              "&.Mui-focused": { color: "#E76F51" },
            },
            "& .MuiInputBase-input": {
              fontFamily: "'Work Sans', sans-serif",
            },
          }}
          InputLabelProps={{
            sx: { fontFamily: "'Work Sans', sans-serif" },
          }}
          inputProps={{ "aria-label": "Filter NGOs by location" }}
        />
        <FormControl
          sx={{
            minWidth: { xs: "100%", sm: 200 },
            bgcolor: "#F9FAFB",
            borderRadius: "12px",
          }}
        >
          <InputLabel
            sx={{
              fontFamily: "'Work Sans', sans-serif",
              color: "#585858",
              "&.Mui-focused": { color: "#E76F51" },
            }}
          >
            Sort By
          </InputLabel>
          <Select
            value={sort}
            label="Sort By"
            onChange={(e) => setSort(e.target.value)}
            sx={{
              borderRadius: "12px",
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E76F51",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E76F51",
              },
              "& .MuiSelect-icon": { color: "#E76F51" },
              "& .MuiInputBase-input": {
                fontFamily: "'Work Sans', sans-serif",
              },
            }}
            inputProps={{ "aria-label": "Sort NGOs" }}
          >
            <MenuItem value="latest">Latest Added</MenuItem>
            <MenuItem value="oldest">Previously Added</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          onClick={() => {
            setSearch("");
            setFilterLocation("");
            setSort("latest");
          }}
          sx={{
            minWidth: { xs: "100%", sm: 120 },
            borderColor: "#E76F51",
            color: "#E76F51",
            fontWeight: 600,
            fontFamily: "'Work Sans', sans-serif",
            textTransform: "none",
            borderRadius: "12px",
            py: 1,
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: "#D65A3C",
              bgcolor: "#FFE5D9",
              transform: "scale(1.05)",
            },
          }}
          aria-label="Reset all filters"
        >
          Reset Filters
        </Button>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {visibleNgos.length === 0 ? (
          <Typography
            sx={{
              textAlign: "center",
              width: "100%",
              mt: { xs: 3, sm: 4 },
              color: "#585858",
              fontFamily: "'Work Sans', sans-serif",
              fontSize: { xs: "1rem", sm: "1.2rem" },
              animation: `${fadeIn} 0.8s ease-out`,
            }}
            aria-live="polite"
          >
            No NGOs found.
          </Typography>
        ) : (
          visibleNgos.map((ngo, idx) => (
            <Grid item xs={12} sm={6} md={4} key={ngo.id}>
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  overflow: "hidden",
                  transition: "all 0.4s ease",
                  animation: `${slideUp} 0.6s ease-out ${0.6 + idx * 0.2}s backwards`,
                  bgcolor: "#fff",
                  "&:hover": {
                    transform: "translateY(-12px)",
                    boxShadow: "0 12px 32px rgba(231, 111, 81, 0.5)",
                    bgcolor: "#FEF8F5",
                  },
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <CardMedia
                  component="img"
                  loading="lazy"
                  sx={{
                    height: { xs: 160, sm: 180, md: 200, lg: 220 },
                    objectFit: "cover",
                    transition: "transform 0.5s ease, opacity 0.5s ease",
                    "&:hover": { transform: "scale(1.06)", opacity: 0.92 },
                    filter: "brightness(0.85)",
                  }}
                  image={ngo.ngo_picture || "/placeholder.jpg"}
                  alt={`${ngo.name} image`}
                />
                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    p: { xs: 2, sm: 2.5, md: 3 },
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#264653",
                        fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" },
                        lineHeight: 1.3,
                      }}
                    >
                      {ngo.name}
                    </Typography>
                    <Chip
                      label={ngo.cause}
                      sx={{
                        mt: 1,
                        bgcolor: "#FFE5D9",
                        color: "#E76F51",
                        fontWeight: 600,
                        fontFamily: "'Work Sans', sans-serif",
                        borderRadius: "8px",
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                        transition: "transform 0.3s ease",
                        "&:hover": { transform: "scale(1.05)" },
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1.5,
                        color: "#585858",
                        lineHeight: 1.7,
                        minHeight: { xs: 80, sm: 90, md: 100 },
                        fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                      }}
                    >
                      {ngo.description?.length > 100
                        ? ngo.description.slice(0, 100) + "..."
                        : ngo.description}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 1.5,
                        color: "#585858",
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                        fontFamily: "'Work Sans', sans-serif",
                      }}
                    >
                      📍 {ngo.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/ngo/${ngo.id}`)}
                      sx={navButtonStyle}
                      aria-label={`View details for ${ngo.name}`}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {visibleCount < filteredNgos.length && (
        <Box sx={{ textAlign: "center", mt: { xs: 3, sm: 4, md: 5 } }}>
          <Button
            variant="contained"
            onClick={handleLoadMore}
            sx={{
              bgcolor: "#E76F51",
              color: "#fff",
              fontWeight: 700,
              fontFamily: "'Work Sans', sans-serif",
              textTransform: "none",
              borderRadius: "12px",
              px: { xs: 3, sm: 4 },
              py: 1.5,
              transition: "all 0.3s ease",
              animation: `${pulse} 2s infinite ease-in-out`,
              "&:hover": {
                bgcolor: "#D65A3C",
                transform: "scale(1.05)",
                boxShadow: "0 6px 20px rgba(231, 111, 81, 0.5)",
              },
              "&:focus": {
                outline: "2px solid #E76F51",
                outlineOffset: 2,
              },
            }}
            aria-label="Load more NGOs"
          >
            Load More
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default NGO_Listings;