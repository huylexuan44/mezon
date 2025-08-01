import { useEscapeKeyClose } from '@mezon/core';
import { deleteClanWebhookById, hasGrandchildModal, selectCurrentClan, settingClanStickerActions, useAppDispatch } from '@mezon/store';
import { ApiClanWebhook, ApiWebhook } from 'mezon-js/api.gen';
import { useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';

interface IDeleteClanWebhookPopupProps {
	closeShowPopup: () => void;
	webhookItem: ApiWebhook;
}

const DeleteClanWebhookPopup = ({ webhookItem, closeShowPopup }: IDeleteClanWebhookPopupProps) => {
	const dispatch = useAppDispatch();
	const currentClan = useSelector(selectCurrentClan);
	const handleDeleteClanWebhook = (webhook: ApiClanWebhook) => {
		dispatch(
			deleteClanWebhookById({
				webhook: webhook,
				clanId: currentClan?.clan_id as string
			})
		);
		closeShowPopup();
	};

	const isChildModal = useSelector(hasGrandchildModal);

	const handleUseEscapeKey = useCallback(() => {
		if (isChildModal) {
			closeShowPopup();
			setTimeout(() => {
				dispatch(settingClanStickerActions.closeModalInChild());
			}, 0);
		}
	}, []);

	const modalRef = useRef<HTMLDivElement>(null);
	useEscapeKeyClose(modalRef, handleUseEscapeKey);

	return (
		<div ref={modalRef} tabIndex={-1} className="fixed inset-0 flex items-center justify-center z-50">
			<div className="fixed inset-0 bg-black opacity-80" />
			<div className="relative z-10 w-[440px]">
				<div className="bg-theme-setting-primary pt-[16px] px-[16px]">
					<div className=" text-[20px] font-semibold pb-[16px]">Delete {webhookItem.webhook_name}</div>
					<div className=" pb-[20px]">
						Are you sure want to delete the <b className="font-semibold">{webhookItem.webhook_name}</b> webhook? This action cannot be
						undone
					</div>
				</div>
				<div className="bg-theme-setting-nav  flex justify-end items-center gap-4 p-[16px] text-[14px] font-medium">
					<div onClick={closeShowPopup} className="hover:underline cursor-pointer">
						Cancel
					</div>
					<div
						onClick={() => handleDeleteClanWebhook(webhookItem)}
						className="bg-red-600 hover:bg-red-700 text-white rounded-sm px-[25px] py-[8px] cursor-pointer"
					>
						Delete
					</div>
				</div>
			</div>
		</div>
	);
};

export default DeleteClanWebhookPopup;
