import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Paper,
  keyframes,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const LOGIN_MUTATION = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        id
        full_name
        role
      }
    }
  }
`;

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Login = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const token = data.loginUser.token;
      localStorage.setItem("cc_token", token);
      if (onSuccess) onSuccess();
      navigate("/ngos");
    },
    onError: (error) => setErrorMsg(error.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ variables: { email, password } });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#FDFCFB",
        py: { xs: 4, sm: 6 },
        animation: `${fadeIn} 0.8s ease-out`,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: { xs: "90%", sm: "400px", md: "450px" },
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          textAlign: "center",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          bgcolor: "#fff",
          animation: `${slideUp} 0.6s ease-out`,
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 8px 25px rgba(231, 111, 81, 0.2)",
          },
        }}
      >
        {/* Logo */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: "'Work Sans', sans-serif",
            fontWeight: 600,
            fontSize: { xs: "1.4rem", sm: "1.6rem" },
            color: "#0B0C10",
            mb: 3,
            animation: `${slideUp} 0.8s ease-out 0.2s backwards`,
          }}
        >
          CauseConnect
          <span
            style={{
              color: "#E76F51",
              fontSize: { xs: "1.4rem", sm: "1.6rem" },
              marginLeft: "3px",
            }}
          >
            .
          </span>
        </Typography>

        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 600,
            fontFamily: "'Work Sans', sans-serif",
            color: "#0B0C10",
            fontSize: { xs: "1.5rem", sm: "1.8rem" },
            animation: `${slideUp} 0.8s ease-out 0.4s backwards`,
          }}
        >
          Welcome Back!
        </Typography>

        {errorMsg && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 2,
              animation: `${fadeIn} 0.5s ease-out`,
            }}
          >
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="dense"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "&:hover fieldset": {
                  borderColor: "#E76F51",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#E76F51",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#E76F51",
              },
            }}
            InputLabelProps={{
              sx: { fontFamily: "'Work Sans', sans-serif" },
            }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="dense"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "&:hover fieldset": {
                  borderColor: "#E76F51",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#E76F51",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#E76F51",
              },
            }}
            InputLabelProps={{
              sx: { fontFamily: "'Work Sans', sans-serif" },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 2,
              bgcolor: "#E76F51",
              color: "#fff",
              fontWeight: 700,
              fontFamily: "'Work Sans', sans-serif",
              textTransform: "none",
              borderRadius: "12px",
              py: { xs: 1.2, sm: 1.5 },
              px: { xs: 4, sm: 5 },
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "#D65A3C",
                transform: "scale(1.05)",
                boxShadow: "0 4px 15px rgba(231, 111, 81, 0.4)",
              },
              animation: `${slideUp} 0.8s ease-out 0.6s backwards`,
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <Typography
          variant="body2"
          sx={{
            mt: 2,
            color: "#585858",
            fontFamily: "'Work Sans', sans-serif",
            animation: `${slideUp} 0.8s ease-out 0.8s backwards`,
          }}
        >
          Don't have an account?{" "}
          <Box
            component="span"
            sx={{
              color: "#E76F51",
              cursor: "pointer",
              fontWeight: 600,
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </Box>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;