import { useAuth } from '@mezon/core';
import { selectCurrentClanId, selectIsShowSettingFooter } from '@mezon/store';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import SettingRightClan from '../SettingRightClanProfile';
import SettingRightUser from '../SettingRightUserProfile';

type SettingRightProfileProps = {
	menuIsOpen: boolean;
	isDM: boolean;
};

export enum EActiveType {
	USER_SETTING = 'USER_SETTING',
	CLAN_SETTING = 'CLAN_SETTING'
}

const SettingRightProfile = ({ menuIsOpen, isDM }: SettingRightProfileProps) => {
	const { userProfile } = useAuth();
	const [activeType, setActiveType] = useState<string>(EActiveType.USER_SETTING);
	const isShowSettingFooter = useSelector(selectIsShowSettingFooter);
	const currentClanId = useSelector(selectCurrentClanId);
	const [clanId, setClanId] = useState<string | undefined>(currentClanId as string);
	const handleClanProfileClick = () => {
		setActiveType(EActiveType.CLAN_SETTING);
	};

	const handleUserSettingsClick = () => {
		setActiveType(EActiveType.USER_SETTING);
	};

	useEffect(() => {
		setActiveType(currentClanId === '0' && isShowSettingFooter.isUserProfile ? EActiveType.USER_SETTING : EActiveType.CLAN_SETTING);
		setClanId(isShowSettingFooter.clanId ? isShowSettingFooter.clanId || '' : currentClanId || '');
	}, [isShowSettingFooter?.profileInitTab, isShowSettingFooter.clanId, currentClanId]);

	return (
		<div
			className={`overflow-y-auto flex flex-col flex-1 shrink  w-1/2 pt-[94px] pb-7 sbm:pr-[10px] pr-[40px] pl-[40px] overflow-x-hidden ${menuIsOpen === true ? 'min-w-[700px]' : ''} 2xl:min-w-[900px] max-w-[740px] hide-scrollbar z-20`}
		>
			<div className="">
				<h1 className="text-xl font-semibold tracking-wider text-theme-primary-active">Profiles</h1>
				<div className="flex flex-row gap-4 mt-6 mb-4">
					<button
						onClick={handleUserSettingsClick}
						className={`pt-1 font-medium text-base tracking-wider border-b-2 ${activeType === EActiveType.USER_SETTING ? 'border-[#155EEF]' : 'border-transparent text-theme-primary-active'}`}
					>
						User Profile
					</button>

					{!isDM || !isShowSettingFooter.isUserProfile ? (
						<button
							onClick={handleClanProfileClick}
							className={`pt-1 font-medium text-base tracking-wider border-b-2 ${activeType === EActiveType.CLAN_SETTING ? 'border-[#155EEF]' : 'border-transparent text-theme-primary-active'}`}
						>
							Clan Profiles
						</button>
					) : null}
				</div>
			</div>

			<div className="flex-1 flex z-0 gap-x-8 sbm:flex-row flex-col">
				{activeType === EActiveType.USER_SETTING ? (
					<SettingRightUser
						onClanProfileClick={handleClanProfileClick}
						name={userProfile?.user?.username || ''}
						avatar={userProfile?.user?.avatar_url || ''}
						currentDisplayName={userProfile?.user?.display_name || ''}
						aboutMe={userProfile?.user?.about_me || ''}
						isDM={isDM}
						dob={userProfile?.user?.dob || ''}
						logo={userProfile?.logo || ''}
					/>
				) : (
					<SettingRightClan clanId={clanId || ''} />
				)}
			</div>
		</div>
	);
};

export default SettingRightProfile;
