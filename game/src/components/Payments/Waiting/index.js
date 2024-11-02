import React from "react";

import { Loading, colors } from "../../Loading";
import { BackButton } from "../../BackButton";

export const Waiting = ({ onBack }) => {
  return (
    <div className="container-loading">
      <BackButton onBack={onBack} />
      <Loading color={colors.blue} />
    </div>
  );
};