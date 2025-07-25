import { PauseIcon, PlayIcon } from '@mezon/mobile-components';
import { baseColor, size, useTheme } from '@mezon/mobile-ui';
import useTabletLandscape from 'apps/mobile/src/app/hooks/useTabletLandscape';
import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import InCallManager from 'react-native-incall-manager';
import Sound from 'react-native-sound';
import { style } from './styles';

const formatTime = (millis: number) => {
	const minutes = Math.floor(millis / 60000);
	const seconds = Math.floor((millis % 60000) / 1000);
	return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const RenderAudioItem = React.memo(({ audioURL }: { audioURL: string }) => {
	const isTabletLandscape = useTabletLandscape();
	const { themeValue } = useTheme();
	const styles = style(themeValue, isTabletLandscape);
	const recordingWaveRef = useRef(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [sound, setSound] = useState<Sound | null>(null);
	const [totalTime, setTotalTime] = useState(0);

	useEffect(() => {
		InCallManager.setSpeakerphoneOn(true);
		InCallManager.setForceSpeakerphoneOn(true);
	}, []);

	useEffect(() => {
		if (!audioURL) return;

		const newSound = new Sound(audioURL, '', (error) => {
			if (error) {
				console.error('Failed to load sound:', error);
				return;
			}
			setTotalTime(newSound.getDuration() * 1000);
			setSound(newSound);
		});

		return () => {
			newSound.release();
		};
	}, [audioURL]);

	const playSound = () => {
		if (sound) {
			sound.play((success) => {
				if (success) {
					sound.setCurrentTime(0);
					recordingWaveRef?.current?.reset();
					setIsPlaying(false);
				}
			});
			setIsPlaying(true);
			recordingWaveRef?.current?.play(0, 45);
		}
	};

	const pauseSound = () => {
		if (sound) {
			sound.pause();
			recordingWaveRef?.current?.pause();
			setIsPlaying(false);
		}
	};

	return (
		<TouchableOpacity onPress={isPlaying ? pauseSound : playSound} activeOpacity={0.6} style={styles.container}>
			<View style={{ flexDirection: 'row', alignItems: 'center', gap: size.s_10 }}>
				<View style={styles.playButton}>
					{isPlaying ? (
						<PauseIcon width={size.s_16} height={size.s_16} color={baseColor.bgDeepLavender} />
					) : (
						<PlayIcon width={size.s_16} height={size.s_16} color={baseColor.bgDeepLavender} />
					)}
				</View>
				<Text style={styles.currentTime}>{`${formatTime(totalTime)}`}</Text>
			</View>
		</TouchableOpacity>
	);
});

export default RenderAudioItem;
