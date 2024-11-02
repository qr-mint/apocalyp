import React from "react";
import { BackButton } from "../BackButton";

export const Window = ({ source, isDev, onBack }) => {
  return (
    <>
      <BackButton onClick={onBack} isDev={isDev} />
      <iframe src={decodeURIComponent(source)} width='100%' height='100%' frameBorder={0} allow={{ clipboardRead: 'clipboard-write' }} />
    </>
  );
};