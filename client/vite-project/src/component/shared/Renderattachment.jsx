import React from "react";
import { transformimage } from "../../lib/Features";
import { FileOpen as FileOpenIcon } from "@mui/icons-material";

const Renderattachment = (file, url) => {
  switch (file) {
    case "vedio":
      return <video src={url} proload="none" controls width="200px" />;
      break;
    case "image":
      return (
        <img
          src={transformimage(url, 200)}
          proload="none"
          width="200px"
          height={"150px"}
          style={{
            objectFit: "contain",
          }}
        />
      );
      break;
    case "audio":
      return <audio src={url} proload="none" controls />;
      break;
    default:
      return <FileOpenIcon />;
  }
};

export default Renderattachment;
