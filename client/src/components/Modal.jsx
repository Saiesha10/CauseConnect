import React from "react";
import { Box, Modal as MUIModal, Typography, IconButton, keyframes } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <MUIModal
      open={isOpen}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
        animation: `${fadeIn} 0.5s ease-out`,
      }}
    >
      <Box
        sx={{
          bgcolor: "#fff",
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          width: { xs: "90%", sm: 450, md: 500 },
          maxHeight: "80vh",
          overflowY: "auto",
          p: { xs: 3, sm: 4 },
          position: "relative",
          animation: `${slideUp} 0.4s ease-out`,
          fontFamily: "'Work Sans', sans-serif",
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "#585858",
            "&:hover": {
              color: "#E76F51",
              bgcolor: "#FFE5D9",
            },
          }}
          aria-label="Close modal"
        >
          <CloseIcon sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }} />
        </IconButton>

        {/* Optional Title */}
        {title && (
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: 700,
              color: "#E76F51",
              mb: 2,
              fontSize: { xs: "1.2rem", sm: "1.4rem" },
              textAlign: "center",
            }}
          >
            {title}
          </Typography>
        )}

        {/* Content */}
        <Box sx={{ color: "#264653", fontSize: { xs: "0.9rem", sm: "1rem" } }}>{children}</Box>
      </Box>
    </MUIModal>
  );
};

export default Modal;