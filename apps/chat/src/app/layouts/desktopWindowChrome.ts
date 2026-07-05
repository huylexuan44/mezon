import { isLinuxDesktop, isMacDesktop, isWindowsDesktop } from '@mezon/utils';

export function shouldShowMacWindowControls(): boolean {
	return isMacDesktop;
}

export function shouldShowWinLinuxTitleBar(): boolean {
	return isWindowsDesktop || isLinuxDesktop;
}

export function shouldShowDesktopWindowChrome(): boolean {
	return shouldShowMacWindowControls() || shouldShowWinLinuxTitleBar();
}

/** Clan sidebar (72px): offset below titlebar / traffic lights on all desktop platforms. */
export function shouldInsetClanSidebar(): boolean {
	return shouldShowMacWindowControls() || shouldShowWinLinuxTitleBar();
}

/** MainLayout: shift entire app below Win/Linux custom titlebar (pre-delete pattern). */
export function getMainLayoutClassName(): string {
	const base = 'w-full bg-theme-primary';
	if (shouldShowWinLinuxTitleBar()) {
		return `${base} top-[21px] fixed`;
	}
	return base;
}

/** DM / channel list column (272px). */
export function getChannelListColumnHeightClass(): string {
	if (shouldShowWinLinuxTitleBar()) {
		return 'max-h-heightTitleBar h-heightTitleBar';
	}
	return 'h-dvh';
}

export function getHeightWithoutTopBarClass(closeMenu: boolean): string {
	if (shouldShowWinLinuxTitleBar()) {
		return closeMenu ? 'h-heightTitleBarWithoutTopBarMobile' : 'h-heightTitleBarWithoutTopBar';
	}
	return closeMenu ? 'h-heightWithoutTopBarMobile' : 'h-heightWithoutTopBar';
}

export function getFixedStreamPanelHeightClass(): string {
	return shouldShowWinLinuxTitleBar() ? 'h-heightTitleBarWithoutTopBar' : 'h-heightWithoutTopBar';
}

export function getMessageViewChatDMMaxHeightClass(): string {
	return shouldShowWinLinuxTitleBar() ? 'max-h-titleBarMessageViewChatDM' : 'max-h-messageViewChatDM';
}

export function getMessageViewChatDMHeightClass(): string {
	return shouldShowWinLinuxTitleBar() ? 'h-heightTitleBarMessageViewChatDM' : 'h-heightMessageViewChatDM';
}

export function getMessageViewChatMaxHeightClass(): string {
	return shouldShowWinLinuxTitleBar()
		? ' max-h-heightTitleBarMessageViewChat h-heightTitleBarMessageViewChat'
		: ' max-h-heightMessageViewChat h-heightMessageViewChat';
}

export function getSidebarScrollHeightClass(): string {
	if (shouldShowWinLinuxTitleBar()) {
		return 'h-[calc(100%-80px)]';
	}
	return 'h-[calc(100dvh_-_10px_-_80px)]';
}

export function getChannelStreamOuterPaddingClass(isChannelStream: boolean): string {
	if (isChannelStream && shouldShowWinLinuxTitleBar()) {
		return 'pb-5';
	}
	return '';
}
