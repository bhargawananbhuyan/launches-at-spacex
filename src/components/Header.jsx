import { Divider } from "@mui/material";
import { StyledHeader } from "./styledComponents";

function Header() {
	return (
		<>
			<StyledHeader>
				<img src={"/assets/spacex-logo.png"} alt="SpaceX logo" />
			</StyledHeader>
			<Divider />
		</>
	);
}

export default Header;
