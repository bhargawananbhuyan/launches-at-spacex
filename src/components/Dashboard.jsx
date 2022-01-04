import {
	CalendarToday,
	Close,
	ExpandMore,
	FilterAlt,
	YouTube,
} from "@mui/icons-material";
import { LocalizationProvider, StaticDatePicker } from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterDayjs";
import {
	Button,
	Chip,
	CircularProgress,
	Container,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	MenuItem,
	Pagination,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
	const navigate = useNavigate();
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
	let [dateFilterText, setDateFilterText] = useState("");
	let [openDetails, setOpenDetails] = useState(false);
	let [details, setDetails] = useState({});

	useEffect(() => {
		navigate(
			`?filter=${searchParams.get("filter") || "all"}&page=${
				searchParams.get("page") || 1
			}
			&start=${searchParams.get("start") || null}&end=${
				searchParams.get("end") || null
			}`
		);

		const start = searchParams.get("start");
		const end = searchParams.get("end");

		if (start === "null" && end === "null") setDateFilterText("All time");
		else if (dayjs(end).diff(dayjs(start), "day") === 7)
			setDateFilterText("Past week");
		else if (dayjs(end).diff(dayjs(start), "month") === 1)
			setDateFilterText("Past month");
		else if (dayjs(end).diff(dayjs(start), "month") === 3)
			setDateFilterText("Past 3 months");
		else if (dayjs(end).diff(dayjs(start), "month") === 6)
			setDateFilterText("Past 6 months");
		else if (dayjs(end).diff(dayjs(start), "year") === 1)
			setDateFilterText("Past year");
		else if (dayjs(end).diff(dayjs(start), "year") === 2)
			setDateFilterText("Past 2 years");
	}, [searchParams, navigate]);

	useEffect(() => {
		// function to handle pagination
		(async () => {
			const filter = searchParams.get("filter");
			const start = searchParams.get("start");
			const end = searchParams.get("end");

			setPagination((prevState) => ({ ...prevState, loading: true }));

			try {
				const res = await axios.get(
					`${url}${filter === "upcoming" ? "/upcoming" : ""}${
						filter === "success"
							? "?launch_success=true"
							: filter === "failure"
							? "?launch_success=false"
							: ""
					}${
						start &&
						start !== "null" &&
						end &&
						end !== "null" &&
						(!filter || filter === "all" || filter === "upcoming")
							? `?start=${start}&end=${end}`
							: start && start !== "null" && end && end !== "null"
							? `&start=${start}&end=${end}`
							: ""
					}`,
					{
						timeout: 1000 * 10, // 10s
						timeoutErrorMessage: "Request time out",
					}
				);
				const resData = await res.data;
				const pageCount = Math.ceil(resData.length / 12);
				setPagination({ loading: false, count: pageCount, error: "" });
			} catch (error) {
				setPagination({ loading: false, count: 0, error: error.message });
			}
		})();

		// function to handle api data
		(async () => {
			const filter = searchParams.get("filter");
			const start = searchParams.get("start");
			const end = searchParams.get("end");

			setApiData((prevState) => ({ ...prevState, loading: true }));
			try {
				const res = await axios.get(
					`${url}${filter === "upcoming" ? "/upcoming" : ""}?offset=${
						(parseInt(searchParams.get("page")) - 1) * 12 || 0
					}&limit=12${
						filter === "success"
							? "&launch_success=true"
							: filter === "failure"
							? "&launch_success=false"
							: ""
					}${
						start && start !== "null" && end && end !== "null"
							? `&start=${start}&end=${end}`
							: ""
					}`,
					{
						timeout: 1000 * 10, // 10s
						timeoutErrorMessage: "Request time out",
					}
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
	}, [searchParams]);

	// function for handling date change (without calendar)
	const handleDateChange = (e, { amount, unit }) => {
		setSearchParams({
			filter: searchParams.get("filter"),
			page: searchParams.get("page"),
			start: dayjs().subtract(amount, unit).format("YYYY-MM-DD"),
			end: dayjs().format("YYYY-MM-DD"),
		});
		setOpenDate(false);
	};

	// function to handle date change (with calendar)
	const handleDateChange2 = (newValue, i) => {
		const start = searchParams.get("start");
		const end = searchParams.get("end");

		if (i === 0) {
			setSearchParams({
				filter: searchParams.get("filter"),
				page: searchParams.get("page"),
				start: searchParams.get("start"),
				end: dayjs(newValue).format("YYYY-MM-DD"),
			});
			setDateFilterText(
				`${start ? `${start} to` : ""} ${dayjs(newValue).format("YYYY-MM-DD")}`
			);
			setOpenDate(false);
		} else if (i === 1) {
			setSearchParams({
				filter: searchParams.get("filter"),
				page: searchParams.get("page"),
				start: dayjs(newValue).format("YYYY-MM-DD"),
				end: searchParams.get("end"),
			});
			setDateFilterText(
				`${dayjs(newValue).format("YYYY-MM-DD")} ${end ? `to ${end}` : ""}`
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
									<TableRow
										key={i}
										hover
										sx={{ cursor: "pointer" }}
										onClick={() => {
											setOpenDetails(true);
											setDetails(apiData.data[i]);
										}}
									>
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
														: "failed"
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
									setSearchParams({
										filter: searchParams.get("filter"),
										page: searchParams.get("page"),
										start: null,
										end: null,
									});
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
									value={searchParams.get("start")}
									minDate={dayjs("2000-01-01")}
									onChange={(newValue) => handleDateChange2(newValue, 1)}
									renderInput={(params) => <TextField {...params} />}
								/>
							</LocalizationProvider>
							<LocalizationProvider dateAdapter={DateAdapter}>
								<StaticDatePicker
									displayStaticWrapperAs="desktop"
									value={searchParams.get("end")}
									minDate={dayjs("2000-01-01")}
									onChange={(newValue) => handleDateChange2(newValue, 0)}
									renderInput={(params) => <TextField {...params} />}
								/>
							</LocalizationProvider>
						</Box>
					</Box>
				</DialogContent>
			</Dialog>

			{/* details dialog */}
			<Dialog
				open={openDetails}
				onClose={() => setOpenDetails(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>
					<IconButton
						onClick={() => {
							setOpenDetails(false);
							setDetails({});
						}}
						sx={{ float: "right" }}
					>
						<Close />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					{details && details.links && details.rocket && details.launch_site && (
						<Box>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<img
									src={details.links.mission_patch_small}
									width={100}
									height="auto"
									alt={details.mission_name}
									title={details.mission_name}
								/>
								<Box>
									<Typography sx={{ ml: 3 }}>
										<Box sx={{ display: "flex", alignItems: "center" }}>
											<Typography
												variant="h5"
												sx={{ mr: 2, fontWeight: "bold" }}
											>
												{details.mission_name}
											</Typography>
											{details.upcoming ? (
												<Chip label="Upcoming" color="warning" />
											) : details.launch_success ? (
												<Chip label="Success" color="success" />
											) : (
												<Chip label="Failed" color="error" />
											)}
										</Box>
										<Box sx={{ mt: 1 }}>{details.rocket.rocket_name}</Box>
									</Typography>
									<Box sx={{ mt: 1.5, ml: 2.5, "& a": { mr: 1 } }}>
										{details.links.article_link && (
											<a
												target={"_blank"}
												rel="noreferrer"
												href={details.links.article_link}
											>
												<img
													src={"/assets/nasa.png"}
													width={25}
													height="auto"
													alt=""
												/>
											</a>
										)}
										{details.links.wikipedia && (
											<a
												target={"_blank"}
												rel="noreferrer"
												href={details.links.wikipedia}
											>
												<img
													src={"/assets/wikipedia.svg"}
													width={25}
													height="auto"
													alt=""
												/>
											</a>
										)}
										{details.links.youtube && (
											<a
												target={"_blank"}
												rel="noreferrer"
												href={`https://www.youtube.com/watch?v=${details.links.youtube_id}`}
											>
												<YouTube />
											</a>
										)}
									</Box>
								</Box>
							</Box>

							<Typography sx={{ my: 3.5, px: 2 }}>
								<span>{`${details.details ?? ""} `}</span>
								{details.links.wikipedia && (
									<a href={details.links.wikipedia}>Wikipedia</a>
								)}
							</Typography>

							<Table>
								<TableBody>
									<TableRow>
										<TableCell>Flight Number</TableCell>
										<TableCell>{details.flight_number}</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>Mission Name</TableCell>
										<TableCell>{details.mission_name}</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>Rocket Type</TableCell>
										<TableCell>{details.rocket.rocket_type}</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>Rocket Name</TableCell>
										<TableCell>{details.rocket.rocket_name}</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>Manufacturer</TableCell>
										<TableCell>
											{details.rocket.second_stage.payloads[0].manufacturer}
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>Nationality</TableCell>
										<TableCell>
											{details.rocket.second_stage.payloads[0].nationality}
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>Launch Date</TableCell>
										<TableCell>
											{dayjs(details.launch_date_utc).format(
												"DD MMMM YYYY HH:mm"
											)}
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>Payload Type</TableCell>
										<TableCell>
											{details.rocket.second_stage.payloads[0].payload_type}
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>Orbit</TableCell>
										<TableCell>
											{details.rocket.second_stage.payloads[0].orbit}
										</TableCell>
									</TableRow>
									<TableRow
										sx={{ "& *": { border: "transparent !important" } }}
									>
										<TableCell>Launch Site</TableCell>
										<TableCell>{details.launch_site.site_name}</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</Box>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}

export default Dashboard;
