import React from "react";
// import { styled } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import { Link as Linkcomponent } from "react-router-dom";

export const VisuallyHiddenInput = styled("input")({
  border: 0,
  clip: "rect(0 0 0 0)",
  height: 1,
  margin: -1,
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
});

export const Link = styled(Linkcomponent)`
  text-decoration: none;
  color: black;
  padding: "1rem";
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

export const Inputbox = styled("input")`
  width: 100%;
  height: 100px;
  border: none;
  outline: none;
  padding: 0 3rem;
  border-radius: 1.5rem;
  background-color: rgba(247, 247, 247, 1);
`;
