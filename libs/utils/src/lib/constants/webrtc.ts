export const WEBRTC_SIGNALING_TYPES = {
	SDP_OFFER: 1,
	SDP_ANSWER: 2,
	ICE_CANDIDATE: 3,
	CANCEL_CALL: 4,
	// Group call events (>= 9)
	GROUP_CALL_OFFER: 9,
	GROUP_CALL_ANSWER: 10,
	GROUP_CALL_QUIT: 11,
	GROUP_CALL_ICE_CANDIDATE: 12,
	GROUP_CALL_JOINED_OTHER_CALL: 13,
	GROUP_CALL_STATUS_REMOTE_MEDIA: 14,
	GROUP_CALL_CANCEL: 15,
	GROUP_CALL_TIMEOUT: 16,
	GROUP_CALL_PARTICIPANT_JOINED: 17,
	GROUP_CALL_PARTICIPANT_LEFT: 18
} as const;

export type WebRTCSignalingType = (typeof WEBRTC_SIGNALING_TYPES)[keyof typeof WEBRTC_SIGNALING_TYPES];
