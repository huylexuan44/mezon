/* eslint-disable @typescript-eslint/no-empty-function */
import { MessagesEntity } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { TypeMessage, addMention, convertDateString } from '@mezon/utils';
import React, { ReactNode, useRef, useState } from 'react';
import { MessageReaction } from '../../components';
import { MessageLineSystem } from '../MessageWithUser/MessageLineSystem';

export type ReactedOutsideOptional = {
	id: string;
	emoji?: string;
	messageId: string;
};

export type MessageWithSystemProps = {
	message: MessagesEntity;
	onContextMenu?: (event: React.MouseEvent<HTMLParagraphElement>) => void;
	popup?: () => ReactNode;
	isSearchMessage?: boolean;
	showDivider?: boolean;
	isTopic: boolean;
};

function MessageWithSystem({ message, onContextMenu, popup, isSearchMessage, showDivider, isTopic }: Readonly<MessageWithSystemProps>) {
	const contentUpdatedMention = addMention(message.content, message?.mentions as any);
	const isCustom = message.code === TypeMessage.CreateThread || message.code === TypeMessage.CreatePin;

	return (
		<>
			{message && showDivider && <MessageDateDivider message={message} />}
			{message && (
				<HoverStateWrapper
					isSearchMessage={isSearchMessage}
					popup={undefined}
					onContextMenu={undefined}
					messageId={message?.id}
					className={'fullBoxText relative group'}
				>
					<div className={`flex items-start min-h-8 relative w-full px-3 text-theme-primary pt-2 pl-5 ${isCustom ? 'pb-2' : ''}`}>
						{message?.code === TypeMessage.Welcome && <Icons.WelcomeIcon defaultSize="size-8 flex-shrink-0" />}
						{message?.code === TypeMessage.CreateThread && <Icons.ThreadIcon defaultSize="size-6 flex-shrink-0" />}
						{message?.code === TypeMessage.CreatePin && <Icons.PinRight defaultSize="size-6 flex-shrink-0" />}
						{message?.code === TypeMessage.AuditLog && <Icons.AuditLogIcon defaultSize="size-8 flex-shrink-0" />}
						<MessageLineSystem
							message={message}
							isTokenClickAble={true}
							isSearchMessage={isSearchMessage}
							isJumMessageEnabled={false}
							content={contentUpdatedMention}
						/>
					</div>
					<MessageReaction message={message} isTopic={isTopic} />
				</HoverStateWrapper>
			)}
		</>
	);
}

const MessageDateDivider = ({ message }: { message: MessagesEntity }) => {
	const messageDate = !message?.create_time ? '' : convertDateString(message?.create_time as string);
	return (
		<div className="mt-5 mb-2  w-full h-px flex items-center justify-center border-b-theme-primary">
			<span className="px-4 bg-item text-theme-primary text-xs font-semibold bg-theme-primary rounded-lg ">{messageDate}</span>
		</div>
	);
};

interface HoverStateWrapperProps {
	children: ReactNode;
	popup?: () => ReactNode;
	isSearchMessage?: boolean;
	onContextMenu?: (event: React.MouseEvent<HTMLParagraphElement>) => void;
	messageId?: string;
	className?: string;
}
const HoverStateWrapper: React.FC<HoverStateWrapperProps> = ({ children, popup, isSearchMessage, onContextMenu, messageId, className }) => {
	const [isHover, setIsHover] = useState(false);
	const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

	const handleMouseEnter = () => {
		if (hoverTimeout.current) {
			clearTimeout(hoverTimeout.current);
		}
		hoverTimeout.current = setTimeout(() => {
			setIsHover(true);
		}, 100);
	};

	const handleMouseLeave = () => {
		if (hoverTimeout.current) {
			clearTimeout(hoverTimeout.current);
		}
		hoverTimeout.current = setTimeout(() => {
			setIsHover(false);
		}, 100);
	};
	return (
		<div
			className={`message-list-item ${isSearchMessage ? 'w-full' : ''}  relative message-container  ${className || ''}`}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onContextMenu={onContextMenu}
			id={`msg-${messageId}`}
		>
			{children}
			{isHover && popup && popup()}
		</div>
	);
};

export default MessageWithSystem;
