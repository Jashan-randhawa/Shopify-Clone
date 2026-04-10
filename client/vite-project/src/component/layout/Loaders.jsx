import React from "react";
import { Grid, Skeleton, Stack } from "@mui/material";

const Loaders = () => {
  return (
    <Grid container height={" calc(100vh - 4rem) "} margin={"1rem"}>
      <Grid
        item
        xs={4}
        md={3}
        sx={{ display: { xs: "none", md: "block" } }}
        height={"100%"}
      >
        <Skeleton variant="rectangular" height={"100vh"} />
      </Grid>
      <Grid item xs={12} sm={8} md={5} lg={6} height={"100%"}>
        <Stack spacing={"1rem"}>
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton key={index} height={"5rem"} variant="rectangular" />
          ))}
        </Stack>
      </Grid>
      <Grid
        item
        md={4}
        lg={3}
        sx={{
          display: { xs: "none", md: "block" },
        }}
        height={"100%"}
      >
        <Skeleton variant="rectangular" height={"100vh"} />
      </Grid>
    </Grid>
  );
};

export default Loaders;
