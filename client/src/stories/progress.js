import React from 'react'
import { storiesOf } from '@storybook/react';
import LinearProgress from '@material-ui/core/LinearProgress';
import AppBar from '@material-ui/core/AppBar';
import Modal from '@material-ui/core/Modal';


function TestProgress(){
		const [isApproving, setApproving] = React.useState(false)
		const [complete, setComplete]		= React.useState(0)
		const [pictures, setPictures] = React.useState(Array.from(new Array(10)).map((e,i) => i))
		console.log('with pictures:%d', pictures.length)

		React.useEffect(() => {
			console.log('approve...')
			let timer
			if(isApproving && pictures.length > 0){
				timer		= setTimeout(() => {
					pictures.shift()
					setPictures([...pictures])
				}, 300)
			}else if(isApproving && pictures.length === 0){
				console.log('finished')
				setApproving(false)
//				setTimeout(() => {
//					window.alert('all tree has been approved')
//				}, 100)
			}
			return () => {
				clearInterval(timer)
			}
		}, [isApproving, pictures])

		//set the complete of progress
		React.useEffect(() => {
			setComplete((10 - pictures.length) * 10)
		}, [pictures])

		function handleApproveAll(){
			if(window.confirm(
				`are you sure to approve these ${pictures.length} trees?`,
			)){
				setApproving(true)
			}
		}

		return (
			<div>
				<h1>tree images</h1>
				<button onClick={handleApproveAll}>approve all</button>
				<div
					style={{
						display		: 'flex',
						flexWrap		: 'wrap',
					}}
				>
					{pictures.map((e,i) => 
						<div
							style={{
								width		: 200,
								height		: 200,
								border		: '1px solid black',
								margin		: 20,
							}}
						>
							PICTURE {e}
						</div>
					)}
				</div>
				{isApproving &&
					<AppBar
						position='fixed'
						style={{
							zIndex		: 10000,
						}}
					>
						<LinearProgress
							color='primary'
							variant='determinate'
							value={complete}
						/>
					</AppBar>
				}
				{false && isApproving &&
					<div
						style={{
							position		: 'absolute',
							top		: 0,
							left		: 0,
							backgroundColor		: 'black',
							width		: '100%',
							height		: '100vh',
							opacity		: 0.5,
						}}
					>

					</div>
				}
				{isApproving && 
					<Modal open={true}>
						<div></div>
					</Modal>
				}
			</div>
		)
}

storiesOf('Progress', module)
	.add('progress', () => 
		<TestProgress/>
	)
