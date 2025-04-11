import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Prediction = () => {
	const [model, setModel] = useState(null);
	const [result, setResult] = useState(null);
	const [recommendation, setRecommendation] = useState(null);
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(false); // Loading state for fetching and prediction
	const [error, setError] = useState(null); // For displaying errors

	// This function sends features to the backend and gets predictions
	const handlePredict = async () => {
		setLoading(true); // Start loading when the request is made
		setError(null); // Clear previous errors
		const res = await axios.post('https://npktester-api.onrender.com/predict', {
			features: [data[0].nitrogen, data[0].phosphorus, data[0].potassium],
		});

		setLoading(false); // Stop loading once the request is done

		if (!res.status == 200) {
			setResult(null);
			setRecommendation(null);
		} else {
			// Set the prediction
			if (res.data.length > 1 && res.data[1].needed_nutrients) {
				setResult(res.data[0].prediction);

				setRecommendation(`
					( N: ${res.data[1]?.needed_nutrients.N}, P: ${res.data[1]?.needed_nutrients.P}, K: ${res.data[1]?.needed_nutrients.K} )`);
			}
			setResult(res.data.prediction);
		}
	};

	// Fetch data from backend (Supabase, for example)
	const fetchData = async () => {
		setLoading(true);

		setResult(null);
		setRecommendation(null);
		setError(null);
		const res = await axios.get(
			'https://npktester-api.onrender.com/sensordata'
		);

		setLoading(false);

		if (!res.status == 200) {
			setData([]);
		} else {
			setData(res.data); // Update state with fetched data
		}
	};

	return (
		<div className='p-4'>
			<div className='mt-4'>
				<button
					onClick={fetchData}
					className='btn btn-primary px-4 py-2 rounded'>
					{loading ? 'Fetching Data...' : 'Fetch Data'}
				</button>

				{error && (
					<div className='mt-3 alert alert-danger'>
						<p className='mb-0'>Error: {error}</p>
					</div>
				)}

				<div className='mt-4'>
					{data.length > 0 ? (
						<div>
							<h4>Sensor Data:</h4>
							<ul className='list-unstyled'>
								<li>
									<strong>Nitrogen:</strong> {data[0].nitrogen}
								</li>
								<li>
									<strong>Phosphorus:</strong> {data[0].phosphorus}
								</li>
								<li>
									<strong>Potassium:</strong> {data[0].potassium}
								</li>
							</ul>
						</div>
					) : (
						<p>No data found</p>
					)}
				</div>
			</div>

			<div className='mt-5'>
				<button
					onClick={handlePredict}
					className='btn btn-success px-4 py-2 rounded'>
					{loading ? 'Predicting...' : 'Predict Plant'}
				</button>

				{result && !loading && (
					<div className='mt-4 alert alert-info'>
						<p>
							<strong>Prediction Result:</strong> {result}
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
