import { Box } from "@mui/system";
import { Divider, useTheme } from "@mui/material";

function Header() {
	const theme = useTheme();
	const classes = useStyles(theme);

	return (
		<>
			<Box component="header" sx={{ ...classes.root }}>
				<img src={"/assets/spacex-logo.png"} alt="SpaceX logo" />
			</Box>
			<Divider />
		</>
	);
}

const useStyles = (theme) => ({
	root: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		marginY: -1.5,
		"& img": {
			width: 200,
			height: "auto",
		},
	},
});

export default Header;
