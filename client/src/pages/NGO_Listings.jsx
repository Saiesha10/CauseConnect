import React, { useState, useMemo } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { gql, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";

const GET_ALL_NGOS = gql`
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

const NGO_Listings = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_ALL_NGOS);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterCause, setFilterCause] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);

  const causes = ["Education", "Health", "Environment", "Animal Welfare", "Women Empowerment", "Disaster Relief"];

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

    if (filterCause) {
      ngos = ngos.filter(
        (ngo) => ngo.cause.toLowerCase() === filterCause.toLowerCase()
      );
    }

    ngos.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return sort === "latest" ? dateB - dateA : dateA - dateB;
    });

    return ngos;
  }, [data, search, sort, filterLocation, filterCause]);

  const visibleNgos = filteredNgos.slice(0, visibleCount);

  const navButtonStyle = {
    backgroundColor: "#E76F51",
    color: "#fff",
    fontWeight: 700,
    textTransform: "none",
    fontFamily: "'Work Sans', sans-serif",
    borderRadius: "8px",
    px: 2.5,
    height: 36,
    "&:hover": { backgroundColor: "#D65A3C" },
  };

  if (loading)
    return <Typography sx={{ textAlign: "center", mt: 10 }}>Loading NGOs...</Typography>;
  if (error)
    return (
      <Typography sx={{ textAlign: "center", mt: 10, color: "red" }}>
        Error: {error.message}
      </Typography>
    );

  return (
    <Box sx={{ p: 4, mt: 10, backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, textAlign: "center", mb: 5, color: "#264653" }}
      >
        Explore NGOs Making an Impact 🌍
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2, mb: 5 }}>
        <TextField
          label="Search NGOs"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 220, backgroundColor: "white" }}
        />
        <TextField
          label="Filter by Location"
          variant="outlined"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          sx={{ minWidth: 220, backgroundColor: "white" }}
        />
        <FormControl sx={{ minWidth: 180, backgroundColor: "white" }}>
          <InputLabel>Filter by Cause</InputLabel>
          <Select
            value={filterCause}
            label="Filter by Cause"
            onChange={(e) => setFilterCause(e.target.value)}
          >
            <MenuItem value="">All Causes</MenuItem>
            {causes.map((cause) => (
              <MenuItem key={cause} value={cause}>{cause}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 160, backgroundColor: "white" }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sort} label="Sort By" onChange={(e) => setSort(e.target.value)}>
            <MenuItem value="latest">Latest Added</MenuItem>
            <MenuItem value="oldest">Previously Added</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {visibleNgos.length === 0 ? (
          <Typography sx={{ textAlign: "center", width: "100%", mt: 4 }}>No NGOs found.</Typography>
        ) : (
          visibleNgos.map((ngo) => (
            <Grid item xs={12} sm={6} md={4} key={ngo.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  "&:hover": { transform: "translateY(-6px)", boxShadow: "0 10px 24px rgba(0,0,0,0.15)" },
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <CardMedia
                  component="img"
                  sx={{ height: 220, objectFit: "cover", transition: "opacity 0.3s ease" }}
                  image={ngo.ngo_picture || "/placeholder.jpg"}
                  alt={ngo.name}
                />

                <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#264653" }}>{ngo.name}</Typography>
                    <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>{ngo.cause}</Typography>
                    <Typography variant="body2" sx={{ mt: 1.5, color: "text.secondary", lineHeight: 1.6, minHeight: 60 }}>
                      {ngo.description?.length > 100 ? ngo.description.slice(0, 100) + "..." : ngo.description}
                    </Typography>
                    <Typography variant="caption" sx={{ display: "block", mt: 1.5, color: "#6B7280" }}>📍 {ngo.location}</Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/ngo/${ngo.id}`)}
                      sx={navButtonStyle}
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
        <Box sx={{ textAlign: "center", mt: 5 }}>
          <Button
            variant="contained"
            onClick={() => setVisibleCount((prev) => prev + 6)}
            sx={{ backgroundColor: "#264653", "&:hover": { backgroundColor: "#1E3A34" }, borderRadius: 2, px: 4, py: 1.2 }}
          >
            Load More
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default NGO_Listings;
