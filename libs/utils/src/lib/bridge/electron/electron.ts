import type { MezonElectronAPI } from './types';

export class ElectronBridge {
	private readonly bridge: MezonElectronAPI = window.electron;

	private static instance: ElectronBridge | undefined;

	public static getInstance(): ElectronBridge {
		if (!ElectronBridge.instance) {
			ElectronBridge.instance = new ElectronBridge();
		}
		return ElectronBridge.instance;
	}

	private constructor() {
		// singleton
	}

	public setBadgeCount(badgeCount: number | null) {
		this.bridge.setBadgeCount(badgeCount);
	}
}

export const electronBridge = ElectronBridge.getInstance();
