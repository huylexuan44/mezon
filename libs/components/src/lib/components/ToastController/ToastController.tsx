import { ToastPayload, selectTheme, selectToasts } from '@mezon/store';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast as showToast } from 'react-toastify';
import MzToast from './MzToast';

function getToastFn(type: ToastPayload['type']) {
	switch (type) {
		case 'success':
			return showToast.success;
		case 'error':
			return showToast.error;
		case 'info':
			return showToast.info;
		case 'warning':
			return showToast.warning;
		default:
			return showToast;
	}
}

const ToastController: React.FC = () => {
	const dispatch = useDispatch();
	const toasts = useSelector(selectToasts);
	const appearanceTheme = useSelector(selectTheme);
	const trackedToasts = useRef<any>({});

	const isDarkMode = appearanceTheme === 'dark';
	const currentTheme = isDarkMode ? 'dark' : 'light';

	useEffect(() => {
		for (const toast of toasts) {
			if (trackedToasts.current[toast.id]) {
				continue;
			}

			const toastFn = getToastFn(toast.type);

			const id = toastFn(<MzToast message={toast.message || ''} type={toast.type || 'default'} />, {
				position: toast.position,
				autoClose: toast.autoClose,
				hideProgressBar: toast.hideProgressBar,
				closeOnClick: toast.closeOnClick,
				pauseOnHover: toast.pauseOnHover,
				draggable: toast.draggable,
				theme: toast.theme || currentTheme, // Use dynamic theme
				toastId: toast.id
			});

			trackedToasts.current[toast.id] = id;
		}
	}, [toasts, trackedToasts, dispatch, currentTheme]);

	return (
		<ToastContainer
			position="top-right"
			autoClose={2200}
			hideProgressBar={false}
			newestOnTop={false}
			closeOnClick
			rtl={false}
			pauseOnFocusLoss
			draggable
			pauseOnHover
			theme={currentTheme}
			limit={5}
			toastStyle={{
				fontFamily: '"gg sans", "Helvetica Neue", Helvetica, Arial, sans-serif'
			}}
		/>
	);
};

export default ToastController;
