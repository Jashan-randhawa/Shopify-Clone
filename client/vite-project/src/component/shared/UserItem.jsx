import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import { Avatar, IconButton, ListItem, Stack, Typography } from "@mui/material";
import { memo, React } from "react";

const UserItem = ({
  user,
  userhandler,
  handlerisloading,
  isadded,
  styling = {},
}) => {
  const { name, avatar, _id } = user;
  return (
    <ListItem>
      <Stack
        direction={"row"}
        alignItems={"center"}
        spacing={"1rem"}
        width={"100%"}
        {...styling}
      >
        <Avatar />
        <Typography
          variant={"body1"}
          sx={{
            flexGrow: 1,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: "1",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
          }}
        >
          {name}
        </Typography>
        <IconButton
          sx={{
            bgcolor: isadded ? "error.main" : "primary.main",
            color: "white",
            "&:hover": { bgcolor: isadded ? "error.dark" : "primary.dark" },
          }}
          onClick={() => userhandler(_id)}
          disabled={handlerisloading}
        >
          {isadded ? <RemoveIcon /> : <AddIcon />}
        </IconButton>
      </Stack>
    </ListItem>
  );
};

export default memo(UserItem);
