import React from 'react';
import { IoIosSearch, IoMdMenu } from 'react-icons/io'
import styled from 'styled-components';


const NavbarContainer = styled.div`
	min-height:60px;
    display:flex;
    flex-direction:row;
 	background:#32312C;
 	justify-content:space-evenly;
`

const NavbarQuranTitle = styled.div`
    color: ${({ theme }) => theme.colors.primary}
`

const NavbarLang = styled.span`
	display:inline-block;
 	font-size:10px;
 	color:lightgrey;
`

const NavbarSInputWrapper = styled.div`
	position:relative;
`

const NavbarInputEl = styled.input`
	background:#1D2021;
	padding:10px;
	width: 180%;
	color: grey;
	height:40px;
	outline: none;
	border: none;
	position: relative;
	right: 60%;
	border-radius:5px;
`
const NavbarSButton = styled.button`
	position:absolute;
	top:20px;
	right:-35px;
	background-color:${({ theme }) => theme.colors.primary};
	border:none;
	border-radius:6px;
	font-size:12px;
	color:white;
	padding-top: 5px;
	padding-bottom: 5px;
	padding-right: 10px;
	padding-left: 10px;
`
const NavbarRContent = styled.div``

const NavbarSIconWrapper = styled.div`
	display:none;
	position:relative;
	top:10px;
	background-color:#4CA9BE;
	border-radius:5px;
	text-align: center;
	height: 40px;
	color: white;
	width: 40px;
`

const NavbarMIcon = styled.div`
	position:absolute;
	top:10px;
	color:grey;
`

const Navbar = () => (
	<NavbarContainer>
		<NavbarQuranTitle> 
			Quran.com 
			&nbsp;<NavbarLang>English</NavbarLang>
		</NavbarQuranTitle>
		<NavbarSInputWrapper>
		<NavbarInputEl placeholder='Search "Noah"' type="text"/>
			<NavbarSButton type="button">Search</NavbarSButton>
		</NavbarSInputWrapper>
		<NavbarRContent>
			<NavbarSIconWrapper>
				<IoIosSearch size={30}/>
			</NavbarSIconWrapper>
			<NavbarMIcon>
				<IoMdMenu size={30}/>
			</NavbarMIcon>
		</NavbarRContent>
	</NavbarContainer>
);

export default Navbar;