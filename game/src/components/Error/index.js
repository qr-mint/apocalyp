import React from "react";
import Portal from "../Portal";

import * as styles from "./style.module.scss";

export const Error = ({ message, ...props }) => {
	return (
		<Portal>
			<div className={styles.container} {...props}>
				<h3 className={styles["title"]}>
					Error 🙈
				</h3>
				<div>
					<p className={styles["subtitle"]}>
						Please write your elements in tech. problem solving support
					</p>
					<div className={styles["container-description"]}>
						{message}
					</div>
					<button
						className={styles["btn-support"]}
						onClick={() => {
							window.Telegram.WebApp.openTelegramLink('https://t.me/qrmint_support');
						}}
					>
						Support
					</button>
				</div>
			</div>
		</Portal>
	);
};