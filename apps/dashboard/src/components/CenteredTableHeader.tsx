import React from 'react';

interface CenteredTableHeaderProps {
	children: React.ReactNode;
}

export default function CenteredTableHeader({ children }: CenteredTableHeaderProps): JSX.Element {
	return <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>{children}</th>;
}
