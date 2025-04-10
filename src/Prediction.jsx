import React, { useState, useEffect } from 'react';

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
		const res = await fetch('https://npk-tester-api.vercel.app/predict', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				features: [data[0].nitrogen, data[0].phosphorus, data[0].potassium], // Use the fetched data
			}),
		});

		setLoading(false); // Stop loading once the request is done

		if (!res.ok) {
			const errorData = await res.json();
			console.error('Error during prediction:', errorData.error);
			setError(errorData.error); // Display the error message in the UI
			setResult(null);
		} else {
			const data = await res.json();
			console.log('Prediction Result:', data[1]);
			setResult(data[0].prediction); // Display the predicted crop
			setRecommendation(
				`
				( N: ${data[1].needed_nutrients.N}, P: ${data[1].needed_nutrients.P}, K: ${data[1].needed_nutrients.K} )`
			);
		}
	};

	// Fetch data from backend (Supabase, for example)
	const fetchData = async () => {
		setLoading(true);

		setResult(null);
		setRecommendation(null);
		setError(null);
		const res = await fetch('https://npk-tester-api.vercel.app/sensordata');

		setLoading(false);

		if (!res.ok) {
			const errorData = await res.json();
			console.error('Error fetching data:', errorData.error);
			setError(errorData.error);
			setData([]);
		} else {
			const fetchedData = await res.json();
			console.log('Fetched Data:', fetchedData);
			setData(fetchedData); // Update state with fetched data
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
