import { useInputValidation } from "6pp";
import { Button, Container, Paper, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
const isadmin = true;

const AdminLogin = () => {
  const handlelogin = (e) => {
    console.log("submitted");
  };

  if (isadmin) {
    return <Navigate to="/admin/dashboard" />;
  }

  const secretkey = useInputValidation("");
  const [islogin, setIsLogin] = useState(true);
  // const [password, setPassword] = useState("");

  return (
    <div
      style={{
        backgroundImage:
          " linear-gradient(rgb(52 13 13 / 50%), rgb(144 140 179 / 50%)) ",
      }}
    >
      <Container
        component={"main"}
        maxWidth="xs"
        sx={{
          height: "120vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {
            <>
              <Typography variant="h5">Admin Login</Typography>
              <form
                style={{
                  width: "100%",
                  marginTop: "1rem",
                }}
                onSubmit={handlelogin}
              >
                <TextField
                  label="Secret Key"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  value={secretkey.value}
                  onChange={secretkey.changeHandler}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                >
                  Login
                </Button>
              </form>
            </>
          }
        </Paper>
      </Container>
    </div>
  );
};

export default AdminLogin;
