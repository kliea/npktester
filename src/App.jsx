import React from 'react';
import Prediction from './Prediction';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
	return (
		<div className='App bg-light min-vh-100 d-flex justify-content-center align-items-center p-3'>
			<div
				className='card bg-white p-4 p-md-5 rounded-4 shadow-lg w-100'
				style={{ maxWidth: '540px' }}>
				<div className='text-center mb-4'>
					<h1
						className='fw-bold text-success mb-2'
						style={{ fontSize: '2rem' }}>
						AgriSENSE: Crop and Fertilizer Recommendation System 🌿
					</h1>
					<p className='text-muted mb-0'>
						Find the best crops to grow based on your soil's NPK levels.
					</p>
				</div>
				<Prediction />
			</div>
		</div>
	);
}

export default App;
