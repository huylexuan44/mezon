import { AttachmentPreviewThumbnail, MentionReactInput, ReplyMessageBox, UserMentionList } from '@mezon/components';
import { useChatSending, useDragAndDrop, usePermissionChecker, useReference } from '@mezon/core';
import {
	fetchMessages,
	referencesActions,
	selectAllChannelMemberIds,
	selectCloseMenu,
	selectCurrentChannel,
	selectCurrentChannelId,
	selectCurrentClanId,
	selectCurrentTopicId,
	selectDataReferences,
	selectFirstMessageOfCurrentTopic,
	selectIsTopicReady,
	selectSession,
	selectStatusMenu,
	useAppDispatch,
	useAppSelector
} from '@mezon/store';
import { CREATING_TOPIC, EOverriddenPermission, IMessageSendPayload, MAX_FILE_ATTACHMENTS, UploadLimitReason } from '@mezon/utils';
import isElectron from 'is-electron';
import FileSelectionButton from 'libs/components/src/lib/components/MessageBox/FileSelectionButton';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useThrottledCallback } from 'use-debounce';
import MemoizedChannelMessages from '../channel/ChannelMessages';

const TopicDiscussionBox = () => {
	const dispatch = useAppDispatch();
	const currentChannelId = useSelector(selectCurrentChannelId);
	const currentChannel = useSelector(selectCurrentChannel);
	const currentClanId = useSelector(selectCurrentClanId);
	const allUserIdsInChannel = useAppSelector((state) => selectAllChannelMemberIds(state, currentChannelId, false));
	const sessionUser = useSelector(selectSession);
	const currentTopicId = useSelector(selectCurrentTopicId);
	const [isFetchMessageDone, setIsFetchMessageDone] = useState(false);
	const dataReferences = useAppSelector((state) => selectDataReferences(state, currentTopicId ?? ''));
	const currentInputChannelId = currentTopicId || CREATING_TOPIC;
	const { removeAttachmentByIndex, checkAttachment, attachmentFilteredByChannelId } = useReference(currentInputChannelId);
	const { setOverUploadingState } = useDragAndDrop();
	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);
	const [canSendMessage] = usePermissionChecker([EOverriddenPermission.sendMessage], currentTopicId ?? '');
	const mode =
		currentChannel?.type === ChannelType.CHANNEL_TYPE_THREAD ? ChannelStreamMode.STREAM_MODE_THREAD : ChannelStreamMode.STREAM_MODE_CHANNEL;
	const handleChildContextMenu = (event: React.MouseEvent) => {
		event.stopPropagation();
	};

	const { sendMessage } = useChatSending({
		mode,
		channelOrDirect: currentChannel
			? {
					channel_id: currentChannel.channel_id,
					clan_id: currentChannel.clan_id,
					channel_private: currentChannel.channel_private
				}
			: undefined,
		fromTopic: true
	});

	const handleSend = useCallback(
		async (
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>
		) => {
			if (!sessionUser) return;

			const safeAttachments = attachments ?? [];
			const isFileOnly = !content?.t && safeAttachments.length > 0;
			if (!content?.t && safeAttachments.length === 0) return;

			await sendMessage(
				content,
				mentions,
				safeAttachments,
				references,
				false,
				false,
				false,
				0
			);

			dispatch(
				referencesActions.setAtachmentAfterUpload({
					channelId: currentInputChannelId,
					files: []
				})
			);

			setIsFetchMessageDone(true);
		},
		[
			sendMessage,
			sessionUser,
			dispatch,
			currentTopicId,
			currentInputChannelId,
			currentChannelId,
			currentClanId
		]
	);






	const handleTyping = useCallback(() => {
	}, []);

	const handleTypingDebounced = useThrottledCallback(handleTyping, 1000);

	const firstMessageOfThisTopic = useSelector(selectFirstMessageOfCurrentTopic);
	const onConvertToFiles = useCallback(
		async (content: string, anonymousMessage?: boolean) => {
			const fileContent = new Blob([content], { type: 'text/plain' });
			const now = Date.now();
			const filename = now + '.txt';
			const file = new File([fileContent], filename, { type: 'text/plain' });

			if (attachmentFilteredByChannelId?.files?.length + 1 > MAX_FILE_ATTACHMENTS) {
				setOverUploadingState(true, UploadLimitReason.COUNT);
				return;
			}

			dispatch(
				referencesActions.setAtachmentAfterUpload({
					channelId: currentInputChannelId,
					files: [
						{
							filename: file.name,
							filetype: file.type,
							size: file.size,
							url: URL.createObjectURL(file)
						}
					]
				})
			);
		},
		[attachmentFilteredByChannelId?.files?.length, currentChannelId]
	);

	const isTopicReady = useSelector(selectIsTopicReady(currentTopicId || ''));
	const hasFetchedRef = useRef(false);

	useEffect(() => {
		if (isTopicReady && !hasFetchedRef.current) {
			dispatch(
				fetchMessages({
					channelId: currentChannelId as string,
					clanId: currentClanId as string,
					topicId: currentTopicId || '',
				})
			);
			setIsFetchMessageDone(true);
			hasFetchedRef.current = true;
		}
		if (!isTopicReady) {
			hasFetchedRef.current = false;
		}
	}, [isTopicReady, currentTopicId, currentChannelId, currentClanId, dispatch]);

	return (
		<>
			{(isFetchMessageDone || firstMessageOfThisTopic) && (
				<div className={`relative ${isElectron() ? 'h-[calc(100%_-_50px_-_30px)]' : 'h-full'}`}>
					<MemoizedChannelMessages
						isPrivate={currentChannel?.channel_private}
						channelId={currentTopicId as string}
						clanId={currentClanId as string}
						type={ChannelType.CHANNEL_TYPE_CHANNEL}
						mode={mode}
						isTopicBox
						userIdsFromTopicBox={allUserIdsInChannel}
						topicId={currentTopicId}
					/>
				</div>
			)}


			<div className="flex flex-col flex-1">
				<div className="flex-shrink-0  flex flex-col pb-[26px] px-4 bg-theme-chat h-auto relative">
					{dataReferences.message_ref_id && (
						<div className="mb-1 px-[1px] w-full ">
							<ReplyMessageBox channelId={currentTopicId ?? ''} dataReferences={dataReferences} />
						</div>
					)}
					{checkAttachment && (
				<div
							className={`${checkAttachment ? 'px-3  pb-1 pt-5  border-b-[1px] border-color-primary' : ''} bg-item-theme max-h-full`}
				>
					<div className={`max-h-full flex gap-6 overflow-y-hidden overflow-x-auto thread-scroll `}>
						{attachmentFilteredByChannelId?.files?.map((item: ApiMessageAttachment, index: number) => {
							return (
								<Fragment key={index}>
									<AttachmentPreviewThumbnail
										attachment={item}
										channelId={currentInputChannelId}
										onRemove={removeAttachmentByIndex}
										indexOfItem={index}
									/>
								</Fragment>
							);
						})}
							</div>
						</div>
					)}
					<div
						className={`flex flex-inline items-start gap-2 box-content max-sm:mb-0
						bg-theme-surface rounded-lg relative shadow-md border-theme-primary ${checkAttachment || (dataReferences && dataReferences.message_ref_id) ? 'rounded-t-none' : 'rounded-t-lg'}
						${closeMenu && !statusMenu ? 'max-w-wrappBoxChatViewMobile' : 'w-wrappBoxChatView'}`}
					>
						<FileSelectionButton
							currentClanId={currentClanId || ''}
							currentChannelId={currentInputChannelId}
							hasPermissionEdit={canSendMessage}
						/>

						<div className={`w-[calc(100%_-_58px)] bg-theme-surface gap-3 flex items-center rounded-e-md`}>
							<div className={`w-full border-none rounded-r-lg gap-3 relative whitespace-pre-wrap`} onContextMenu={handleChildContextMenu}>
								<MentionReactInput
									onSend={handleSend}
									onTyping={handleTypingDebounced}
									listMentions={UserMentionList({
										channelID: currentChannel?.channel_id as string,
										channelMode: ChannelStreamMode.STREAM_MODE_CHANNEL
									})}
									isTopic
									handleConvertToFile={onConvertToFiles}
									currentChannelId={currentInputChannelId}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

		</>
	);
};

export default TopicDiscussionBox;
