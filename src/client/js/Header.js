import React from 'react'

class Header extends React.Component {
	render () {
		return (
			<div className="logo-container">
				<img src="img/favicon/android-chrome-512x512.png" className="logo"/>
				<p className="logo-text">Leverj</p>
				<p>Sample Text</p>
			</div>
		)
	}
}

export default Header
