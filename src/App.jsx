import React from 'react';
import Prediction from './Prediction';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
	return (
		<div className='App bg-light min-vh-100 d-flex justify-content-center align-items-center p-3'>
			<div
				className='card bg-white p-4 p-sm-5 rounded-lg shadow-lg w-100'
				style={{ maxWidth: '500px' }}>
				<h1 className='display-5 display-sm-4 font-weight-bold text-center text-primary mb-4'>
					Plant Recommendation System
				</h1>
				<p className='text-center text-muted mb-4'>
					Discover the best plants for your environment based on NPK values!
				</p>
				<Prediction />
			</div>
		</div>
	);
}

export default App;
