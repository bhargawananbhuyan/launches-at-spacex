// utils
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import DateAdapter from "@mui/lab/AdapterDayjs";

// UI stuff
import { CalendarToday, ExpandMore, FilterAlt } from "@mui/icons-material";
import { LocalizationProvider, StaticDatePicker } from "@mui/lab";
import { Box } from "@mui/system";
import {
	Button,
	Chip,
	CircularProgress,
	Container,
	Dialog,
	DialogContent,
	MenuItem,
	Pagination,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
} from "@mui/material";
import {
	StyledDateFilter,
	StyledError,
	StyledFilterHeader,
	StyledLoading,
	StyledSelect,
	StyledTableContainer,
} from "./styledComponents";

const url = "https://api.spacexdata.com/v3/launches";

function Dashboard() {
	const [searchParams, setSearchParams] = useSearchParams();
	let [pagination, setPagination] = useState({
		loading: false,
		count: 0,
		error: "",
	});
	let [apiData, setApiData] = useState({
		loading: false,
		data: [],
		error: "",
	});

	let [openDate, setOpenDate] = useState(false);
	let [date, setDate] = useState([null, null]); // to be removed and instead we'll use searchParams
	let [dateFilterText, setDateFilterText] = useState("All time");

	useEffect(() => {
		(async () => {
			const filter = searchParams.get("filter");

			setPagination((prevState) => ({ ...prevState, loading: true }));

			try {
				const res = await axios.get(
					`${url}${filter === "upcoming" ? "/upcoming" : ""}${
						filter === "success"
							? "?launch_success=true"
							: filter === "failure"
							? "?launch_success=false"
							: ""
					}`
				);
				const resData = await res.data;
				const pageCount = Math.ceil(resData.length / 12);
				setPagination({ loading: false, count: pageCount, error: "" });
			} catch (error) {
				setPagination({ loading: false, count: 0, error: error.message });
			}
		})();
	}, [searchParams, date]);

	const navigate = useNavigate();
	useEffect(() => {
		navigate(
			`?filter=${searchParams.get("filter") || "all"}&page=${
				searchParams.get("page") || 1
			}`
		);
	}, [searchParams]);

	useEffect(() => {
		(async () => {
			const filter = searchParams.get("filter");

			setApiData((prevState) => ({ ...prevState, loading: true }));
			try {
				const res = await axios.get(
					`${url}${filter === "upcoming" ? "/upcoming" : ""}?offset=${
						(parseInt(searchParams.get("page")) - 1) * 12
					}&limit=12${
						filter === "success"
							? "&launch_success=true"
							: filter === "failure"
							? "&launch_success=false"
							: ""
					}${
						date[0] !== null && date[1] !== null
							? `&start=${date[0]}&end=${date[1]}`
							: ""
					}`
				);
				const resData = await res.data;
				if (resData.length > 0) {
					setApiData({ loading: false, data: resData, error: "" });
				} else {
					setApiData({
						loading: false,
						data: [],
						error: "No results found for the specified filter.",
					});
				}
			} catch (error) {
				setApiData({
					loading: false,
					data: [],
					error: error.message,
				});
			}
		})();
	}, [searchParams, date]);

	// function for handling date change (without calendar)
	const handleDateChange = (e, { amount, unit }) => {
		setDateFilterText(e.target.textContent);
		setDate([
			dayjs().subtract(amount, unit).format("YYYY-MM-DD"),
			dayjs().format("YYYY-MM-DD"),
		]);
		setOpenDate(false);
	};

	// function to handle date change (with calendar)
	const handleDateChange2 = (newValue, i) => {
		if (i === 0) {
			setDate((d) => [d[i], dayjs(newValue).format("YYYY-MM-DD")]);
			setDateFilterText(
				`${!date[i] ? "" : `${date[i]} to`} ${dayjs(newValue).format(
					"YYYY-MM-DD"
				)}`
			);
			setOpenDate(false);
		} else if (i === 1) {
			setDate((d) => [dayjs(newValue).format("YYYY-MM-DD"), d[1]]);
			setDateFilterText(
				`${dayjs(newValue).format("YYYY-MM-DD")} ${
					!date[i] ? "" : `to ${date[i]}`
				}`
			);
		}
	};

	return (
		<>
			<Container maxWidth="xl">
				<StyledFilterHeader>
					<StyledSelect
						value={
							searchParams.get("filter") || "all" // or(||) part: before component is mounted (to remove NaN error)
						}
						onChange={(e) => {
							setSearchParams({
								filter: e.target.value,
								page: 1,
							});
						}}
						startAdornment={<FilterAlt />}
						IconComponent={ExpandMore}
					>
						<MenuItem value={"all"}>All launches</MenuItem>
						<MenuItem value={"upcoming"}>Upcoming launches</MenuItem>
						<MenuItem value={"success"}>Success launches</MenuItem>
						<MenuItem value={"failure"}>Failure launches</MenuItem>
					</StyledSelect>
					<Button
						disableRipple
						startIcon={<CalendarToday />}
						endIcon={<ExpandMore />}
						onClick={() => setOpenDate(true)}
					>
						{dateFilterText}
					</Button>
				</StyledFilterHeader>

				<StyledTableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								{[
									"No:",
									"Launched (UTC)",
									"Location",
									"Mission",
									"Orbit",
									"Launch Status",
									"Rocket",
								].map((label, i) => (
									<TableCell key={i}>{label}</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{!apiData.loading &&
							!pagination.loading &&
							apiData.data.length > 0 ? (
								apiData.data.map((instance, i) => (
									<TableRow key={i}>
										<TableCell>{instance["flight_number"]}</TableCell>
										<TableCell>
											{dayjs(instance["launch_date_utc"]).format(
												"DD MMMM YYYY [at] HH:mm"
											)}
										</TableCell>
										<TableCell>
											{instance["launch_site"]["site_name"]}
										</TableCell>
										<TableCell>{instance["mission_name"]}</TableCell>
										<TableCell>
											{
												instance["rocket"]["second_stage"]["payloads"][0][
													"orbit"
												]
											}
										</TableCell>
										<TableCell>
											<Chip
												color={
													instance["upcoming"]
														? "warning"
														: instance["launch_success"]
														? "success"
														: "error"
												}
												label={
													instance["upcoming"]
														? "upcoming"
														: instance["launch_success"]
														? "success"
														: "failure"
												}
											/>
										</TableCell>
										<TableCell>{instance["rocket"]["rocket_name"]}</TableCell>
									</TableRow>
								))
							) : apiData.loading || pagination.loading ? (
								<StyledLoading>
									<td>
										<CircularProgress />
										<span>loading...</span>
									</td>
								</StyledLoading>
							) : apiData.error || pagination.error ? (
								<StyledError>
									<td>{apiData.error || pagination.error}</td>
								</StyledError>
							) : (
								<></>
							)}
						</TableBody>
					</Table>
				</StyledTableContainer>

				{/* pagination */}
				{!pagination.loading && !apiData.error && (
					<Pagination
						sx={{ float: "right", my: 3.5 }}
						count={pagination.count}
						page={
							parseInt(searchParams.get("page")) || 1 // or(||) part: before component is mounted (to remove NaN error)
						}
						onChange={(e, newValue) => {
							e.preventDefault();
							setSearchParams({
								filter: searchParams.get("filter"),
								page: newValue,
							});
						}}
						variant="outlined"
						shape="rounded"
					/>
				)}
			</Container>

			<Dialog
				open={openDate}
				onClose={() => setOpenDate(false)}
				maxWidth="md"
				fullWidth
			>
				<DialogContent sx={{ p: 3.5 }}>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<StyledDateFilter>
							<Button
								onClick={(e) => {
									setDate([null, null]);
									setDateFilterText(e.target.textContent);
									setOpenDate(false);
								}}
							>
								All time
							</Button>
							<Button
								onClick={(e) => handleDateChange(e, { amount: 7, unit: "d" })}
							>
								Past week
							</Button>
							<Button
								onClick={(e) => handleDateChange(e, { amount: 1, unit: "M" })}
							>
								Past month
							</Button>
							<Button
								onClick={(e) => handleDateChange(e, { amount: 3, unit: "M" })}
							>
								Past 3 months
							</Button>
							<Button
								onClick={(e) => handleDateChange(e, { amount: 6, unit: "M" })}
							>
								Past 6 months
							</Button>
							<Button
								onClick={(e) => handleDateChange(e, { amount: 1, unit: "y" })}
							>
								Past year
							</Button>
							<Button
								onClick={(e) => handleDateChange(e, { amount: 2, unit: "y" })}
							>
								Past 2 years
							</Button>
						</StyledDateFilter>
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<LocalizationProvider dateAdapter={DateAdapter}>
								<StaticDatePicker
									displayStaticWrapperAs="desktop"
									value={date[0]}
									onChange={(newValue) => handleDateChange2(newValue, 1)}
									renderInput={(params) => <TextField {...params} />}
								/>
							</LocalizationProvider>
							<LocalizationProvider dateAdapter={DateAdapter}>
								<StaticDatePicker
									displayStaticWrapperAs="desktop"
									value={date[1]}
									onChange={(newValue) => handleDateChange2(newValue, 0)}
									renderInput={(params) => <TextField {...params} />}
								/>
							</LocalizationProvider>
						</Box>
					</Box>
				</DialogContent>
			</Dialog>
		</>
	);
}

export default Dashboard;
