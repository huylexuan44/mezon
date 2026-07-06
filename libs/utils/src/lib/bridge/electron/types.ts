export type ElectronBridgeHandler = (...args: unknown[]) => void;

export type MezonElectronAPI = {
	send: (eventName: string, ...params: unknown[]) => void;
	invoke?: (channel: string, data?: unknown) => Promise<unknown>;
	on: (eventName: string, callback: ElectronBridgeHandler) => void;
};

declare global {
	interface Window {
		electron: MezonElectronAPI;
	}
}
