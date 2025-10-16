import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Paper,
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

const Login = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
  onCompleted: (data) => {
    const token = data.loginUser.token; // <-- use loginUser here
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
        bgcolor: "#fff",
        pt: "80px",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: { xs: "90%", sm: "360px" },
          p: 4,
          borderRadius: 3,
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontWeight: 600,
            fontFamily: "'Work Sans', sans-serif",
            color: "#0B0C10",
          }}
        >
          Welcome Back!
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
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
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="dense"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 2,
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
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
