/*
 * Just a logo icon
 */
import React		from 'react'

export default function IconLogo(){
	return (
		<img
			style={{
				maxWidth		: 149,
				maxHeight		: 32,
        verticalAlign: 'middle'
			}}
			src={require('./images/logo.png')} />
	)
}
