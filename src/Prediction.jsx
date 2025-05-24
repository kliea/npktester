import React, { useState } from 'react';
import axios from 'axios';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid,
	LabelList,
} from 'recharts';
import { motion } from 'framer-motion';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const plantImages = {
	rice: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Rice_Harvest_2020_-_50248678242.jpg',
	maize:
		'https://upload.wikimedia.org/wikipedia/commons/0/0d/Starr-120606-7054-Zea_mays-ears_for_sale-Laulima_Farm_Kipahulu-Maui_%2825026486812%29.jpg',
	kidneybeans:
		'https://upload.wikimedia.org/wikipedia/commons/a/ac/Sa_kidneybeans.jpg',
	mungbean:
		'https://upload.wikimedia.org/wikipedia/commons/f/f2/Sa_green_gram.jpg',
	banana:
		'https://upload.wikimedia.org/wikipedia/commons/7/77/Banana_d%C3%A1gua.jpg',
	mango: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Hapus_Mango.jpg',
	orange:
		'https://upload.wikimedia.org/wikipedia/commons/c/c4/Orange-Fruit-Pieces.jpg',
	papaya: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Papaya.svg',
	coconut:
		'https://upload.wikimedia.org/wikipedia/commons/d/dc/Coconut_tree_06264.JPG',
	coffee:
		'https://upload.wikimedia.org/wikipedia/commons/c/c5/Roasted_coffee_beans.jpg',
};

const Prediction = () => {
	const [result, setResult] = useState(null);
	const [recommendation, setRecommendation] = useState([]);
	const [data, setData] = useState([]);
	const [isFetching, setIsFetching] = useState(false);
	const [isPredicting, setIsPredicting] = useState(false);
	const [error, setError] = useState(null);

	const handlePredict = async () => {
		try {
			setIsPredicting(true);
			setError(null);

			const res = await axios.post(
				'https://npktester-api.onrender.com/predict',
				// 'http://localhost:5000/sensordata',
				{
					features: [data.nitrogen, data.phosphorus, data.potassium],
				}
			);

			if (res.data.needed_nutrients) {
				setResult(res.data.prediction);
				const nutrients = Object.entries(res.data.needed_nutrients).map(
					([name, value]) => ({ name, value })
				);
				setRecommendation(nutrients);
				console.log('Recommendation:', nutrients);
			} else {
				setResult(null);
				setRecommendation(null);
			}
		} catch (err) {
			console.error(err);
			setError('Prediction failed');
		} finally {
			setIsPredicting(false);
		}
	};

	const fetchData = async () => {
		try {
			setIsFetching(true);
			setResult(null);
			setRecommendation(null);
			setError(null);

			const res = await axios.get(
				'https://npktester-api.onrender.com/sensordata'
				// 'http://localhost:5000/sensordata'
			);
			if (res.status === 200) {
				setData({
					nitrogen: '86.2',
					phosphorus: '121',
					potassium: '517.2',
					soil: '1167.3',
				});
			} else {
				setData([]);
				setError('Failed to fetch data');
			}
		} catch (err) {
			console.error(err);
			setError('Sensor fetch failed');
		} finally {
			setIsFetching(false);
		}
	};

	const nutrientData = [
		{ name: 'Nitrogen', value: data.nitrogen || 0, unit: 'mg/kg' },
		{ name: 'Phosphorus', value: data.phosphorus || 0, unit: 'mg/kg' },
		{ name: 'Potassium', value: data.potassium || 0, unit: 'mg/kg' },
	];

	const maxNutrient = 800;
	const imageUrl = result?.toLowerCase() && plantImages[result.toLowerCase()];

	const chartData = [{ name: 'Soil Moisture', value: data.soil || 0 }];

	const nutrientColors = {
		MOP: 'bg-success', // Potassium (Muriate of Potash)
		TSP: 'bg-warning', // Phosphorus (Triple Super Phosphate)
		Urea: 'bg-info', // Nitrogen
	};

	const nutrientOrder = ['Urea', 'TSP', 'MOP'];

	const sortedRecommendation = Array.isArray(recommendation)
		? [...recommendation].sort(
				(a, b) => nutrientOrder.indexOf(a.name) - nutrientOrder.indexOf(b.name)
		  )
		: [];

	return (
		<div className='p-4 max-w-3xl mx-auto'>
			<button onClick={fetchData} className='btn btn-primary px-4 py-2 rounded'>
				{isFetching ? 'Fetching Data...' : 'Fetch Data'}
			</button>

			{error && (
				<div className='mt-2 alert alert-danger'>
					<p className='mb-0'>Error: {error}</p>
				</div>
			)}

			{data?.nitrogen !== undefined && (
				<div className='mt-6'>
					<h3 className='text-lg font-medium mt-4'>Sensor Readings</h3>

					<div className='flex flex-wrap gap-6 text-center mt-2 bg-black text-white py-4 rounded-lg shadow-md'>
						{nutrientData.map((nutrient, idx) => {
							const percentage = (nutrient.value / maxNutrient) * 100; // Calculate percentage for each nutrient

							return (
								<div
									key={idx}
									className='d-flex flex-column align-items-center'>
									<p className='text-sm mb-2 text-white'>
										{nutrient.name} Value ({nutrient.unit})
									</p>
									<div
										style={{
											width: 80,
											height: 80,
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
										}}>
										<CircularProgressbar
											value={percentage} // Use the calculated percentage for each nutrient
											text={`${nutrient.value} mg/kg`}
											strokeWidth={10}
											styles={{
												path: {
													stroke:
														percentage <= 33
															? '#facc15'
															: percentage <= 66
															? '#34d399'
															: '#059669', // Conditional color based on percentage
												},
												trail: {
													stroke: '#e6e6e6', // Faint background for the gauge
												},
												text: {
													fill: 'white', // Text color
													fontSize: '12px',
													fontWeight: 'bold',
												},
											}}
										/>
									</div>
									<div className='mt-2 text-center'>
										<div className='small text-white'>
											0 &nbsp;&nbsp;&nbsp;&nbsp; {maxNutrient}
										</div>
									</div>
								</div>
							);
						})}
					</div>
					{chartData.map((nutrient, idx) => {
						const isSoilMoisture = nutrient.name === 'Soil Moisture';
						const value =
							nutrient.value && !isNaN(nutrient.value) ? nutrient.value : 0; // Ensure valid value, default to 0

						const barData = [{ name: nutrient.name, value }];

						return (
							<div
								key={idx}
								className='flex flex-col items-center min-w-[250px]'>
								<p className='text-sm mb-2 text-gray-400 mt-4 text-center'>
									{nutrient.name} Value ({nutrient.unit || 'mg/kg'})
								</p>

								<ResponsiveContainer width={200} height={150}>
									<BarChart data={barData} layout='horizontal'>
										<CartesianGrid strokeDasharray='3 3' stroke='#f9fafb' />
										<YAxis type='number' domain={[0, 1500]} />
										<XAxis type='category' dataKey='name' />
										<Tooltip />
										<Bar
											dataKey='value'
											fill={isSoilMoisture ? '#facc15' : '#34d399'}
											background={{ fill: '#d1fae5' }} // Corrected background fill
											radius={[6, 6, 6, 6]}>
											<LabelList
												dataKey='value'
												position='center'
												fill='#059669'
												content={({ x, y, width, height, value }) => (
													<text
														x={x + width / 2} // Centers the text in the bar
														y={y + height / 2} // Centers the text vertically
														textAnchor='middle' // Centers the text horizontally
														dominantBaseline='middle' // Vertically centers the text
														fill='#059669' // Color of the text
														fontSize={12} // Adjust the font size
														fontWeight='bold'>
														{value}
													</text>
												)}
											/>
										</Bar>
									</BarChart>
								</ResponsiveContainer>
								<div className='text-xs mt-1 text-success font-medium text-center'>
									{value >= 1100 ? (
										<span>High sensor accuracy</span>
									) : (
										<span>Low sensor accuracy</span>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}

			{data.nitrogen && (
				<div className='mt-5'>
					<button
						onClick={handlePredict}
						disabled={isPredicting}
						className={`btn btn-success px-4 py-2 rounded ${
							isPredicting ? 'opacity-50 cursor-not-allowed' : ''
						}`}>
						{isPredicting ? 'Calculating...' : 'Recommended Crop'}
					</button>
				</div>
			)}

			{result && !isPredicting && (
				<div className='mt-5'>
					<h3 className='text-lg font-medium text-center'>
						Recommended Crop: <span className='text-uppercase'>{result}</span>
					</h3>
					<div className='mt-3'>
						{imageUrl && (
							<motion.img
								src={imageUrl}
								alt={result}
								className='rounded-lg'
								whileHover={{ scale: 1.1 }}
								style={{
									maxWidth: '300px',
									maxHeight: '300px',
									width: '100%',
									height: 'auto',
								}} // Restrict size
								transition={{ duration: 0.3 }}
							/>
						)}
						<div>
							<h3 className='text-lg font-medium text-center'>
								Fertilizer Recommendation
							</h3>
							{recommendation && (
								<div className='d-flex flex-wrap justify-content-center gap-3 mt-4'>
									{sortedRecommendation.length > 0 ? (
										sortedRecommendation.map((item, index) => (
											<span
												key={index}
												className={`badge rounded-pill ${
													nutrientColors[item.name] || 'bg-secondary'
												} text-light px-4 py-2`}>
												{item.name}: {item.value} kg/ha
											</span>
										))
									) : (
										<p className='text-center text-muted'>
											No recommendations available.
										</p>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Prediction;
