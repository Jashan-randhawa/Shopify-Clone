import React from "react";
import { Helmet } from "react-helmet-async";

const Title = ({ title = "chat app", description = "This is chat APP " }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Helmet>
  );
};

export default Title;
