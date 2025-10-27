import React from "react";
import { gql, useQuery } from "@apollo/client";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Stack,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Container,
  keyframes,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

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

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "linear-gradient(135deg, #FDFCFB 0%, #F5F5F5 100%)" }}>
        <CircularProgress sx={{ color: "#E76F51" }} />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", bgcolor: "linear-gradient(135deg, #FDFCFB 0%, #F5F5F5 100%)", pt: 6 }}>
        <Alert severity="error" sx={{ fontFamily: "'Work Sans', sans-serif", fontSize: { xs: "0.9rem", sm: "1rem" }, mb: 2 }}>
          Failed to load donations. Please try again.
        </Alert>
      </Box>
    );

  const donations = data?.[organizer ? "organizerDonations" : "userDonations"] || [];

  return (
    <Box
      sx={{
        bgcolor: "linear-gradient(135deg, #FDFCFB 0%, #F5F5F5 100%)",
        minHeight: "100vh",
        pt: { xs: 10, sm: 12 },
        pb: 6,
        animation: `${fadeIn} 1s ease-out`,
      }}
    >
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
            animation: `${slideUp} 0.8s ease-out 0.2s backwards`,
          }}
        >
          {organizer ? "Donations to My NGOs" : "My Donations"}
        </Typography>

        {donations.length === 0 ? (
          <Typography
            sx={{
              fontFamily: "'Work Sans', sans-serif",
              color: "#585858",
              textAlign: "center",
              fontSize: { xs: "1rem", sm: "1.2rem" },
              animation: `${slideUp} 0.8s ease-out 0.4s backwards`,
            }}
          >
            No donations found.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {donations.map((donation, idx) => {
              const displayName = organizer
                ? donation.user?.full_name || "Anonymous Donor"
                : donation.ngo?.name || "Unknown NGO";
              const contactInfo = organizer
                ? donation.user?.email || donation.user?.phone || "N/A"
                : donation.ngo?.contact_info || "N/A";
              const profilePic = organizer
                ? donation.user?.profile_picture || "/default-user.png"
                : donation.ngo?.ngo_picture || "/default-ngo.png";

              return (
                <Grid item xs={12} sm={6} md={4} key={donation.id}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      height: "100%",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 12px 32px rgba(231, 111, 81, 0.3)",
                      },
                      bgcolor: "#FFF3EF",
                      animation: `${slideUp} 0.6s ease-out ${0.4 + idx * 0.2}s backwards`,
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Stack spacing={1.5}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar
                            src={profilePic}
                            alt={displayName}
                            sx={{
                              width: { xs: 40, sm: 48 },
                              height: { xs: 40, sm: 48 },
                              bgcolor: "#FFE5D9",
                              border: "2px solid #E76F51",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                          />
                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: "'Work Sans', sans-serif",
                              fontWeight: 700,
                              color: "#E76F51",
                              fontSize: { xs: "1.2rem", sm: "1.4rem" },
                            }}
                          >
                            {displayName}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 1, bgcolor: "#FFE5D9" }} />

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "'Work Sans', sans-serif",
                              fontWeight: 600,
                              color: "#264653",
                              fontSize: { xs: "0.85rem", sm: "0.9rem" },
                            }}
                          >
                            Amount:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "'Work Sans', sans-serif",
                              fontWeight: 500,
                              color: "#585858",
                              fontSize: { xs: "0.85rem", sm: "0.9rem" },
                            }}
                          >
                            ₹{donation.amount}
                          </Typography>
                        </Box>

                        {donation.message && (
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "'Work Sans', sans-serif",
                                fontWeight: 600,
                                color: "#264653",
                                fontSize: { xs: "0.85rem", sm: "0.9rem" },
                              }}
                            >
                              Message:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "'Work Sans', sans-serif",
                                fontStyle: "italic",
                                color: "#585858",
                                fontSize: { xs: "0.85rem", sm: "0.9rem" },
                                maxWidth: "60%",
                                textAlign: "right",
                              }}
                            >
                              {donation.message}
                            </Typography>
                          </Box>
                        )}

                        <Box>
                          {donation.message && (
                            <Chip
                              label="Message included"
                              size="small"
                              sx={{
                                bgcolor: "#FFE5D9",
                                color: "#E76F51",
                                fontFamily: "'Work Sans', sans-serif",
                                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                                mr: 1,
                                mt: 0.5,
                              }}
                            />
                          )}
                          {organizer && !donation.user?.full_name && (
                            <Chip
                              label="Anonymous Donor"
                              size="small"
                              sx={{
                                bgcolor: "#E0F7FA",
                                color: "#0277BD",
                                fontFamily: "'Work Sans', sans-serif",
                                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                                mt: 0.5,
                              }}
                            />
                          )}
                        </Box>

                        {organizer ? (
                          <>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "'Work Sans', sans-serif",
                                  fontWeight: 600,
                                  color: "#264653",
                                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                                }}
                              >
                                Email:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "'Work Sans', sans-serif",
                                  fontWeight: 500,
                                  color: "#585858",
                                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                                }}
                              >
                                {donation.user?.email || "N/A"}
                              </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "'Work Sans', sans-serif",
                                  fontWeight: 600,
                                  color: "#264653",
                                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                                }}
                              >
                                Phone:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "'Work Sans', sans-serif",
                                  fontWeight: 500,
                                  color: "#585858",
                                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                                }}
                              >
                                {donation.user?.phone || "N/A"}
                              </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "'Work Sans', sans-serif",
                                  fontWeight: 600,
                                  color: "#264653",
                                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                                }}
                              >
                                NGO:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "'Work Sans', sans-serif",
                                  fontWeight: 500,
                                  color: "#585858",
                                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                                }}
                              >
                                {donation.ngo?.name || "Unknown NGO"}
                              </Typography>
                            </Box>
                          </>
                        ) : (
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "'Work Sans', sans-serif",
                                fontWeight: 600,
                                color: "#264653",
                                fontSize: { xs: "0.85rem", sm: "0.9rem" },
                              }}
                            >
                              NGO Contact:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "'Work Sans', sans-serif",
                                fontWeight: 500,
                                color: "#585858",
                                fontSize: { xs: "0.85rem", sm: "0.9rem" },
                              }}
                            >
                              {donation.ngo?.contact_info || "N/A"}
                            </Typography>
                          </Box>
                        )}

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "'Work Sans', sans-serif",
                              fontWeight: 600,
                              color: "#264653",
                              fontSize: { xs: "0.85rem", sm: "0.9rem" },
                            }}
                          >
                            Date:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "'Work Sans', sans-serif",
                              fontWeight: 500,
                              color: "#585858",
                              fontSize: { xs: "0.85rem", sm: "0.9rem" },
                            }}
                          >
                            {parseDate(donation.created_at)}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default DonationList;