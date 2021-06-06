import React from 'react';
import Wrapper, { WrapperVarient } from './Wrapper';
import NavBar from './NavBar';

interface LayoutProps {
	variant?: WrapperVarient;
}

const Layout: React.FC<LayoutProps> = ({ children, variant }) => {
	return (
		<>
			<NavBar />
			<Wrapper variant={variant}>{children}</Wrapper>
		</>
	);
};

export default Layout;
