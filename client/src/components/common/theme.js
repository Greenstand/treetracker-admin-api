/* 
 * The Material-UI theme for the whole UI
 */
import {createMuiTheme}		from '@material-ui/core/styles'

const colorPrimary		= '#76BB23'
const colorPrimarySelected		= 'rgba(118, 187, 35, 0.3)'
const colorPrimaryHover		= 'rgba(118, 187, 35, 0.1)'

export default createMuiTheme({
	spacing		: 4,
	typography		: {
		fontSize		: 11,
		//htmlFontSize		: 20,
		fontFamily: [
			'Lato',
			'Roboto', 
			'Helvetica', 
			'Arial', 
			'sans-serif',
		].join(','),
		h5		: {
			fontWeight		: 700,
		},
		h6		: {
			fontWeight		: 700,
		},
		subtitle1		: {
			fontWeight		: 700,
		},
	},
  palette: {
    primary: {
      main: colorPrimary,
			//very light primary color, for background sometimes
			lightVery		: '#F9FCF4',
    },
		action		: {
			active		: 'rgba(0, 0, 0, .34)',
			hover		: 'rgba(135, 195, 46, .08)',
			selected		: 'rgba(135, 195, 46, .14)',
		},
  },
	overrides		: {
		MuiButton		: {
			root		: {
				fontSize		: '.785rem',
			},
			label		: {
				textTransform		: 'capitalize',
			},
		},
		MuiOutlinedInput		: {
			input		: {
				padding		: '10.5px 7px',
			}
		},
		MuiListItem		: {
			root		: {
				'&.Mui-selected' : {
					color		: colorPrimary,
					backgroundColor		: colorPrimarySelected,
					'&:hover'		: {
						backgroundColor		: colorPrimarySelected,
					},
				},
			},
			button		: {
				'&:hover'		: {
					color		: colorPrimary,
					backgroundColor		: colorPrimaryHover,
				},
			},
		},
		MuiSelect		: {
			select		: {
				'&:focus'		: {
					color		: colorPrimary,
					backgroundColor		: colorPrimaryHover,
				},
			},
		},
		MuiTableRow		: {
			root		: {
				'&.MuiTableRow-hover'		: {
					'&:hover'		: {
						backgroundColor		: colorPrimaryHover,
					},
					'&:hover .MuiTableCell-body'		: {
						color		: colorPrimary,
					},
				},
			},
		},
		MuiTableCell		: {
			head		: {
				fontSize		: '.785rem',
				fontWeight		: 700,
				color		: '#494747',
			},
			body		: {
				fontSize		: '.785rem',
			},
		},
	},
	props		: {
		MuiButton		: {
			variant		: 'outlined',
		},
		MuiTextField		: {
			variant		: 'outlined',
		},
	},
})
