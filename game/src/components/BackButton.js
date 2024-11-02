import React from "react";
import { BackButton as TGBackButton } from "@vkruglikov/react-telegram-web-app";

export const BackButton = ({ onClick, isDev }) => {
  return (
    <>
      <TGBackButton onClick={onClick} />
      {isDev && <button onClick={onClick}>Back</button>}
    </>
  );
}