import React from "react";

import * as styles from "./style.module.scss";

export const Blocked = () => {
  return (
    <div className={styles.container}>
      <p>Play your on mobile device</p>
      <img src="https://arweave.net/I32lQvhg3AQLX4Dc-3NHUwsCN6nu8-lxGsRcNwe3cr4" />
      <div className={styles.telegram}>
        <span>@apocalypton_bot</span>
      </div>
      <div style={{ marginTop: 30 }}>Made by @QRMint_bot</div>
    </div>
  );
};