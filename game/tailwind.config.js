/** @type {import('tailwindcss').Config} */
import konstaConfig from 'konsta/config';

export default konstaConfig({
	darkMode: 'class',
	content: [ './index.html', './src/**/*.{js,ts,jsx,tsx}' ],
	plugins: [],
});
