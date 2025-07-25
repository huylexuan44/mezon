import { selectAllChannels, selectCurrentClanId, useAppSelector } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { ChannelStatusEnum } from '@mezon/utils';
import { Dropdown } from 'flowbite-react';
import { ChannelType } from 'mezon-js';
import { ApiSystemMessage, ApiSystemMessageRequest } from 'mezon-js/api.gen';
import React, { useMemo } from 'react';

type SystemMessagesManagementProps = {
	updateSystem: ApiSystemMessage | null;
	setUpdateSystemMessageRequest: React.Dispatch<React.SetStateAction<ApiSystemMessageRequest | null>>;
	channelSelectedId: string;
};

const SystemMessagesManagement = ({ updateSystem, setUpdateSystemMessageRequest, channelSelectedId }: SystemMessagesManagementProps) => {
	const channelsList = useAppSelector(selectAllChannels);
	const currentClanId = useAppSelector(selectCurrentClanId);
	const selectedChannel = useMemo(() => {
		return channelsList.find((channel) => channel.id === channelSelectedId);
	}, [channelSelectedId]);

	const handleToggleSetting = (checked: boolean, type: ETypeUpdateSystemMessage, channelId?: string) => {
		if (channelId && channelId !== channelSelectedId && type === ETypeUpdateSystemMessage.CHANNEL) {
			setUpdateSystemMessageRequest({ ...updateSystem, channel_id: channelId });
			return;
		}
		switch (type) {
			case ETypeUpdateSystemMessage.HIDE_AUDIT_LOG:
				setUpdateSystemMessageRequest({ ...updateSystem, hide_audit_log: checked ? '0' : '1' });
				break;
			case ETypeUpdateSystemMessage.SETUP_TIPS:
				setUpdateSystemMessageRequest({ ...updateSystem, setup_tips: checked ? '1' : '0' });
				break;
			case ETypeUpdateSystemMessage.WELCOME_STICKER:
				setUpdateSystemMessageRequest({ ...updateSystem, welcome_sticker: checked ? '1' : '0' });
				break;
			case ETypeUpdateSystemMessage.WELCOME_RANDOM:
				setUpdateSystemMessageRequest({ ...updateSystem, welcome_random: checked ? '1' : '0' });
				break;
			case ETypeUpdateSystemMessage.BOOTS_MESSAGE:
				setUpdateSystemMessageRequest({ ...updateSystem, boost_message: checked ? '1' : '0' });
				break;
			default:
				break;
		}
	};
	return (
		<div className={'border-t-theme-primary mt-10 pt-10 flex flex-col '}>
			<h3 className="text-sm font-bold uppercase mb-2">System Messages Channel</h3>
			<Dropdown
				placement={'bottom-start'}
				label={''}
				renderTrigger={() => (
					<div className="w-full h-10 rounded-md flex flex-row p-3 justify-between items-center uppercase text-sm border border-theme-primary bg-theme-input ">
						<div className={' flex flex-row items-center'}>
							<Icons.Hashtag defaultSize="w-4 h-4 " />
							<p>{selectedChannel?.channel_label}</p>
							<p className={'uppercase ml-5 font-semibold'}>{selectedChannel?.category_name}</p>
						</div>
						<div>
							<Icons.ArrowDownFill />
						</div>
					</div>
				)}
				className={'h-fit max-h-[200px] text-xs overflow-y-scroll customSmallScrollLightMode bg-theme-input px-2 z-20'}
			>
				{channelsList
					.filter(
						(channel) =>
							channel.clan_id === currentClanId &&
							channel.type === ChannelType.CHANNEL_TYPE_CHANNEL &&
							channel.channel_private !== ChannelStatusEnum.isPrivate
					)
					.map((channel) =>
						channel.channel_id !== selectedChannel?.channel_id ? (
							<Dropdown.Item
								key={channel.id}
								className="flex flex-row items-center rounded-sm text-sm w-full py-2 px-4 text-left cursor-pointer"
								onClick={() => handleToggleSetting(true, ETypeUpdateSystemMessage.CHANNEL, channel.id)}
							>
								{channel?.channel_private ? (
									<Icons.HashtagLocked defaultSize="w-4 h-4 dark:text-channelTextLabel" />
								) : (
									<Icons.Hashtag defaultSize="w-4 h-4 dark:text-channelTextLabel" />
								)}
								<p>{channel.channel_label ?? ''}</p>
								<p className="uppercase ml-5 font-semibold">{channel.category_name}</p>
							</Dropdown.Item>
						) : null
					)}
			</Dropdown>
			<p className={'text-sm py-2'}>This is the channel we send system event messages to. These can be turned off at any time</p>
			<ToggleItem
				label={'Send a random welcome message when someone joins this server.'}
				value={updateSystem?.welcome_random === '1'}
				handleToggle={(e) => handleToggleSetting(e, ETypeUpdateSystemMessage.WELCOME_RANDOM)}
			/>
			<ToggleItem
				label={'Prompt members to reply to welcome messages with a sticker.'}
				value={updateSystem?.welcome_sticker === '1'}
				handleToggle={(e) => handleToggleSetting(e, ETypeUpdateSystemMessage.WELCOME_STICKER)}
			/>
			<ToggleItem
				label={'Send a message when someone Boosts this server.'}
				value={updateSystem?.boost_message === '1'}
				handleToggle={(e) => handleToggleSetting(e, ETypeUpdateSystemMessage.BOOTS_MESSAGE)}
			/>
			<ToggleItem
				label={'Send helpful tips for server setup.'}
				value={updateSystem?.setup_tips === '1'}
				handleToggle={(e) => handleToggleSetting(e, ETypeUpdateSystemMessage.SETUP_TIPS)}
			/>
			<ToggleItem
				label={'Send a log when an action is applied to the clan'}
				value={updateSystem?.hide_audit_log !== '1'}
				handleToggle={(e) => handleToggleSetting(e, ETypeUpdateSystemMessage.HIDE_AUDIT_LOG)}
			/>
		</div>
	);
};

export default SystemMessagesManagement;

enum ETypeUpdateSystemMessage {
	WELCOME_RANDOM = 1,
	WELCOME_STICKER = 2,
	BOOTS_MESSAGE = 3,
	SETUP_TIPS = 4,
	HIDE_AUDIT_LOG = 5,
	CHANNEL = 6
}

type ToggleItemProps = {
	label: string;
	value: boolean;
	handleToggle: (checked: boolean) => void;
};

const ToggleItem: React.FC<ToggleItemProps> = ({ label, value, handleToggle }) => {
	return (
		<div className="self-stretch justify-start items-center gap-3 inline-flex text-sm py-1">
			<div className="grow shrink basis-0 h-6 justify-start items-center gap-1 flex">
				<p>{label}</p>
			</div>
			<div className="relative flex flex-wrap items-center">
				<input
					className="peer relative h-4 w-8 cursor-pointer appearance-none rounded-lg
						bg-slate-300 transition-colors after:absolute after:top-0 after:left-0 after:h-4 after:w-4 after:rounded-full
						after:bg-slate-500 after:transition-all
						checked:bg-[#5265EC] checked:after:left-4 checked:after:bg-white
						hover:bg-slate-400 after:hover:bg-slate-600
						checked:hover:bg-[#4654C0] checked:after:hover:bg-white
						focus:outline-none focus-visible:outline-none"
					type="checkbox"
					checked={value}
					onChange={(e) => handleToggle(e.target.checked)}
				/>
			</div>
		</div>
	);
};
