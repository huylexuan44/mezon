import {
	checkMaximizedState,
	closeWindow,
	listenToWindowStateChanges,
	maximizeWindow,
	minimizeWindow,
	selectIsMaximized,
	selectIsWindowFocused,
	useAppDispatch,
	useAppSelector,
	windowControlsActions
} from '@mezon/store';
import { Icons } from '@mezon/ui';
import React, { useCallback, useEffect } from 'react';
import { WEBKIT_NO_DRAG } from '../styles/commonStyles';

interface MacOSWindowControlsProps {
	className?: string;
}

const TRAFFIC_ICON_CLASS = 'w-2 h-2 text-black';

export const MacOSWindowControls: React.FC<MacOSWindowControlsProps> = ({ className }) => {
	const dispatch = useAppDispatch();
	const isMaximized = useAppSelector(selectIsMaximized);
	const isWindowFocused = useAppSelector(selectIsWindowFocused);

	useEffect(() => {
		const handleFocus = () => dispatch(windowControlsActions.setIsWindowFocused(true));
		const handleBlur = () => dispatch(windowControlsActions.setIsWindowFocused(false));

		window.addEventListener('focus', handleFocus);
		window.addEventListener('blur', handleBlur);

		return () => {
			window.removeEventListener('focus', handleFocus);
			window.removeEventListener('blur', handleBlur);
		};
	}, [dispatch]);

	const handleMinimize = useCallback(() => {
		dispatch(minimizeWindow());
	}, [dispatch]);

	const handleMaximize = useCallback(() => {
		dispatch(maximizeWindow());
	}, [dispatch]);

	const handleClose = useCallback(() => {
		dispatch(closeWindow());
	}, [dispatch]);

	useEffect(() => {
		dispatch(checkMaximizedState());
		dispatch(listenToWindowStateChanges());
	}, [dispatch]);

	const MacOSButton: React.FC<{
		onClick: () => void;
		backgroundColor: string;
		icon: React.ReactNode;
	}> = ({ onClick, backgroundColor, icon }) => (
		<button
			type="button"
			onClick={onClick}
			className="group flex h-3 w-3 cursor-pointer items-center justify-center overflow-hidden rounded-full border-none p-0 transition-opacity duration-200 ease-in-out"
			style={{ backgroundColor, ...WEBKIT_NO_DRAG }}
		>
			<span
				className={`flex h-full w-full items-center justify-center opacity-0 transition-opacity duration-200 ${isWindowFocused ? 'group-hover:opacity-100' : ''}`}
			>
				{icon}
			</span>
		</button>
	);

	return (
		<div
			className={`pointer-events-auto fixed left-0 top-0 z-[9999] flex items-center gap-2 pl-3 pr-2 py-3 ${className ?? ''}`}
			style={WEBKIT_NO_DRAG}
		>
			<MacOSButton onClick={handleClose} backgroundColor="#ff5f57" icon={<Icons.MacOSCloseIcon className={TRAFFIC_ICON_CLASS} />} />
			<MacOSButton onClick={handleMinimize} backgroundColor="#ffbd2e" icon={<Icons.MacOSMinimizeIcon className={TRAFFIC_ICON_CLASS} />} />
			<MacOSButton
				onClick={handleMaximize}
				backgroundColor="#28ca42"
				icon={<Icons.MacOSMaximizeIcon isMaximized={isMaximized} className={TRAFFIC_ICON_CLASS} />}
			/>
		</div>
	);
};
