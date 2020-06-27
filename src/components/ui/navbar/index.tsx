import React from 'react';
import { IoIosSearch, IoMdMenu } from 'react-icons/io'
// import style from './index.sass'

const Navbar = () => (
	<div className="navbar-container">
		<div className="navbar-quran-title">Quran.com <span className="navbar-lang">English</span></div>
		<div className="navbar-s-input-wrapper">
			<input placeholder='Search "Noah"' type="text" className="navbar-input-el"/>
			<button className="navbar-s-button">Search</button>
		</div>
		<div className="navbar-r-content">
			<div className="navbar-sicon-wrapper">
				<IoIosSearch size={30}/>
			</div>
			<IoMdMenu className="navbar-micon" size={30}/>
		</div>
	</div>
);

export default Navbar;