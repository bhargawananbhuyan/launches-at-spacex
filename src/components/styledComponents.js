import {
	colors,
	Select,
	tableCellClasses,
	TableContainer,
} from "@mui/material";
import { Box, styled } from "@mui/system";

export const StyledHeader = styled(Box)`
	display: flex;
	justify-content: center;
	margin-top: -5px;
	margin-bottom: -5px;

	& img {
		width: 150px;
		height: auto;
	}
`;

export const StyledFilterHeader = styled(Box)`
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-direction: row-reverse;
	margin-top: 25px;
	margin-bottom: 25px;

	& button {
		text-transform: capitalize;
		font-size: 1rem;
		color: rgb(25, 25, 25);
		font-weight: normal;
	}
`;

export const StyledSelect = styled(Select)`
	* {
		border: none !important;
	}

	& svg:nth-of-type(1) {
		margin-right: 10px;
	}
`;

export const StyledTableContainer = styled(TableContainer)`
	min-height: 75vh;
	position: relative;

	& .${tableCellClasses.head} {
		background-color: rgb(230, 230, 230);
		padding: 20px 32px;
	}

	& .${tableCellClasses.body} {
		padding: 16px 32px;
		border: none;
		font-size: 1rem;
	}
`;

export const StyledDateFilter = styled(Box)`
	border-right: 2px solid ${colors.grey[300]};
	display: flex;
	flex-direction: column;
	gap: 5px;
	padding-right: 25px;
	align-items: flex-start;

	& button {
		text-transform: capitalize;
		font-size: 1rem;
		color: rgb(25, 25, 25);
	}
`;

export const StyledLoading = styled("tr")`
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;

	& td {
		display: flex;
		align-items: center;
		& span {
			margin-left: 1rem;
		}
	}
`;

export const StyledError = styled("tr")`
	position: absolute;
	top: 120px;
	left: 0;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`;
