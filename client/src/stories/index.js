import React, {useState} from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import IconLogo		from '../components/IconLogo';
import Filter		from '../components/Filter';
import {MuiThemeProvider, MuiThemeProvider as Theme, createMuiTheme}		from '@material-ui/core/styles'
import {theme}		from '../App';
import Typography		from '@material-ui/core/Typography';
import {withTheme}		from '@material-ui/core/styles';
import FilterModel		from '../models/Filter';
import './progress';

storiesOf('Welcome', module)
	.add('Greenstand logo', 
		() => <IconLogo/>
	);

function FilterControl(props){
	//{{{
	const [isOpen, setOpen]		= useState(false)

	const filter		= new FilterModel()
	filter.treeId		= 10
	filter.status		= 'Planted'
	
	return (
		<div>
			<button onClick={() => setOpen(!isOpen)} >open</button>
			<Filter
				isOpen={isOpen}
				filter={filter}
				onSubmit={r => console.warn('do filter:%o', r)}
			/>
		</div>
	)
	//}}}
}

storiesOf('Filter', module)
	.add('Filter',
		() => 
		<MuiThemeProvider theme={theme} >
			<Filter isOpen={true} />
		</MuiThemeProvider>
	)
	.add('FilterControl',
		() => 
		<MuiThemeProvider theme={theme} >
			<FilterControl/>
		</MuiThemeProvider>
	)

function TypographyTest(){
	//{{{
  return (
    <div>
      <Typography variant="h1">
        h1. Heading
      </Typography>
      <Typography variant="h2" gutterBottom>
        h2. Heading
      </Typography>
      <Typography variant="h3" gutterBottom>
        h3. Heading
      </Typography>
      <Typography variant="h4" gutterBottom>
        h4. Heading
      </Typography>
      <Typography variant="h5" gutterBottom>
        h5. Heading
      </Typography>
      <Typography variant="h6" gutterBottom>
        h6. Heading
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        subtitle1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
      </Typography>
      <Typography variant="subtitle2" gutterBottom>
        subtitle2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
      </Typography>
      <Typography variant="body1" gutterBottom>
        body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
        unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam
        dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
      </Typography>
      <Typography variant="body2" gutterBottom>
        body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
        unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam
        dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
      </Typography>
      <Typography variant="button" display="block" gutterBottom>
        button text
      </Typography>
      <Typography variant="caption" display="block" gutterBottom>
        caption text
      </Typography>
      <Typography variant="overline" display="block" gutterBottom>
        overline text
      </Typography>
    </div>
  );
	//}}}
}

const PaletteTest		= withTheme()(function(props){
	//{{{
	const {theme}		= props
	console.log('theme:%o', theme)
	return (
		<div>
			<h1>background color</h1>
			{['primary', 'secondary', 'error'].map(key => 
				<div
					style={{
						width		: 200,
						height		: 40,
						background		: theme.palette[key].main,
						color		: theme.palette[key].contrastText,
					}}
				>
					{key}
				</div>
			)}
			<h1>text color</h1>
			{['primary', 'secondary', 'disabled', 'hint'].map(key =>
				<div
					style={{
						color		: theme.palette.text[key],
					}}
				>
					{key}
				</div>
			)}
			<h1>grey</h1>
			{Object.keys(theme.palette.grey).map(key =>
				<div
					style={{
						color		: 'white',
						background		: theme.palette.grey[key],
					}}
				>
					{key}
				</div>
			)}
		</div>
	)
	//}}}
})

storiesOf('Theme', module)
	.add('Typography', () => <TypographyTest/>)
	.add('Palette', () => <Theme theme={theme} ><PaletteTest/></Theme>)
