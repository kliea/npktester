import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid,
} from 'recharts';

const Prediction = () => {
	const [model, setModel] = useState(null);
	const [result, setResult] = useState(null);
	const [recommendation, setRecommendation] = useState(null);
	const [data, setData] = useState([]);
	const [isFetching, setIsFetching] = useState(false); // Loading state for fetching data
	const [isPredicting, setIsPredicting] = useState(false); // Loading state for prediction
	const [error, setError] = useState(null); // For displaying errors

	// This function sends features to the backend and gets predictions
	const handlePredict = async () => {
		setIsPredicting(true); // Start loading when the request is made
		setError(null); // Clear previous errors
		const res = await axios.post('https://npktester-api.onrender.com/predict', {
			features: [data.nitrogen, data.phosphorus, data.potassium],
		});

		setIsPredicting(false); // Stop loading once the request is done

		if (!res.status == 200) {
			setResult(null);
			setRecommendation(null);
		} else {
			if (res.data.needed_nutrients) {
				setResult(res.data.prediction);
				setRecommendation(`
					( Urea: ${res.data?.needed_nutrients.Urea} kg/ha, TSP: ${res.data?.needed_nutrients.TSP} kg/ha, MOP: ${res.data?.needed_nutrients.MOP} kg/ha, )`);
			}
			setResult(res.data.prediction);
		}
	};

	const fetchData = async () => {
		setIsFetching(true);

		setResult(null);
		setRecommendation(null);
		setError(null);
		const res = await axios.get(
			'https://npktester-api.onrender.com/sensordata'
		);
		console.log(res.data);
		setIsFetching(false);

		if (!res.status == 200) {
			setData([]);
		} else {
			setData(res.data); // Update state with fetched data
		}
	};

	const chartData = [
		{ name: 'Nitrogen', value: data.nitrogen || 0 },
		{ name: 'Phosphorus', value: data.phosphorus || 0 },
		{ name: 'Potassium', value: data.potassium || 0 },
	];
	return (
		<div className='p-2'>
			<div className=''>
				<button
					onClick={fetchData}
					className='btn btn-primary px-4 py-2 rounded'>
					{isFetching ? 'Fetching Data...' : 'Fetch Data'}
				</button>

				{error && (
					<div className='mt-2 alert alert-danger'>
						<p className='mb-0'>Error: {error}</p>
					</div>
				)}

				{data ? (
					<>
						{/* Sensor Data */}
						{data && data.nitrogen !== undefined && (
							<>
								<h3 className='text-lg font-medium mb-2'>Sensor Readings</h3>
								<ul className='mb-4'>
									<li>
										<strong>Nitrogen:</strong> {data.nitrogen}
									</li>
									<li>
										<strong>Phosphorus:</strong> {data.phosphorus}
									</li>
									<li>
										<strong>Potassium:</strong> {data.potassium}
									</li>
									<li>
										<strong>Soil Moisture:</strong> {data.soil}
									</li>
								</ul>

								{/* Chart */}
								<ResponsiveContainer width='100%' height={250}>
									<BarChart data={chartData}>
										<CartesianGrid strokeDasharray='3 3' />
										<XAxis dataKey='name' />
										<YAxis />
										<Tooltip />
										<Bar dataKey='value' fill='#82ca9d' />
									</BarChart>
								</ResponsiveContainer>
							</>
						)}
					</>
				) : (
					<p>No data found</p>
				)}
			</div>
			<div className='mt-5'>
				{data.nitrogen && (
					<button
						onClick={handlePredict}
						className='btn btn-success px-4 py-2 rounded'>
						{isPredicting ? 'Calculating...' : 'Recommended Plant'}
					</button>
				)}
				{result && !isPredicting && (
					<div className='mt-4 alert alert-info'>
						<p>
							<strong>Recommended plant for this soil:</strong> {result}
							<br />
							{recommendation && (
								<span>
									<strong>Needed Nutrients:</strong> {recommendation}
								</span>
							)}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default Prediction;
