import { Card, colors, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useEffect, useState } from "react";

const url = "https://api.spacexdata.com/v3/launches";

function Dashboard() {
	let [apiData, setApiData] = useState({
		loading: false,
		data: [],
		error: "",
	});

	useEffect(() => {
		(async () => {
			setApiData((d) => ({ ...d, loading: true }));
			try {
				const res = await axios({
					method: "GET",
					url: `${url}?offset=0&limit=12`,
					// timeout: 5000,
					// timeoutErrorMessage: "Request time out",
				});
				const resData = await res.data;
				setApiData(() => ({ loading: false, data: resData, error: "" }));
			} catch (error) {
				setApiData(() => ({
					loading: false,
					data: [],
					error: error.message || "oops! error occured.",
				}));
			}
		})();
	}, []);

	const theme = useTheme();
	const classes = useStyles(theme);

	return (
		<>
			{apiData.loading && <Typography>loading...</Typography>}
			{apiData.data.length > 0 && (
				<Box sx={classes.root}>
					<Card sx={classes.tableContainer} variant="outlined">
						<Box component="table" cellSpacing={0}>
							<thead>
								<tr>
									<th>No.</th>
									<th>Launched (UTC)</th>
									<th>Location</th>
									<th>Mission</th>
									<th>Orbit</th>
									<th>Launch Status</th>
									<th>Rocket</th>
								</tr>
							</thead>
							<tbody>
								{apiData.data.map((instance, i) => (
									<tr key={i}>
										<td>{instance["flight_number"]}</td>
										<td>{instance["launch_date_utc"]}</td>
										<td>{instance["launch_site"]["site_name"]}</td>
										<td>{instance["mission_name"]}</td>
										<td>
											{
												instance["rocket"]["second_stage"]["payloads"][0][
													"orbit"
												]
											}
										</td>
										<td>
											<Typography
												sx={{
													backgroundColor: instance["upcoming"]
														? colors.yellow[200]
														: instance["launch_success"]
														? colors.green[200]
														: colors.red[200],
													color: instance["upcoming"]
														? colors.yellow[900]
														: instance["launch_success"]
														? colors.green[900]
														: colors.red[900],
													textAlign: "center",
													fontWeight: "bold",
													py: 0.5,
													borderRadius: 1,
												}}
											>
												{instance["upcoming"]
													? "upcoming"
													: instance["launch_success"]
													? "success"
													: "failure"}
											</Typography>
										</td>
										<td>{instance["rocket"]["rocket_name"]}</td>
									</tr>
								))}
							</tbody>
						</Box>
					</Card>
				</Box>
			)}
			{apiData.error && <Typography>{apiData.error}</Typography>}
		</>
	);
}

const useStyles = (theme) => ({
	root: {
		display: "flex",
		justifyContent: "center",
		my: 5,
	},
	tableContainer: {
		borderRadius: 2.5,
		height: 850,
		"& table": {
			pb: 2.5,
			"& thead": {
				backgroundColor: colors.grey[200],
				"& th": {
					py: 2,
					px: 6.5,
					textAlign: "left",
					borderColor: "none",
				},
			},
			"& tbody": {
				"& td": {
					px: 6.5,
					py: 2,
				},
			},
		},
	},
});

export default Dashboard;
