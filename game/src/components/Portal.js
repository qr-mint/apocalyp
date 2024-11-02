import React, { useState, useEffect } from 'react';
import ReactDom from "react-dom";

const Portal = ({ children }) => {
	const [ mounted, setMounted ] = useState(false);
	useEffect(() => {
		setMounted(true);
		return () => setMounted(false);
	}, []);

	return mounted ? (
		ReactDom.createPortal(children, document.getElementById('root'))
	) : (
		<></>
	);
};

export default Portal;
