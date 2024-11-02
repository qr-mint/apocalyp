import React from "react";
import cn from 'classnames';

import * as styles from "./style.module.scss";

import { colors } from './enum';
export const Loading = ({ className, color = colors.while, ...props }) => {
	return (
		<div
			{...props}
			className={cn(
				styles['loader'],
				className, { [styles[color]]: !!color }
			)}
		>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
	);
};
