import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
	usernameMessageBox: {
		fontSize: size.medium,
		marginRight: size.s_4,
		fontWeight: '700',
		maxWidth: '60%'
	},
	dateMessageBox: {
		fontSize: size.small,
		color: Colors.gray72
	},
	wrapperAvatarCombine: {
		width: size.s_40
	},
	messageBoxTop: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		marginBottom: size.s_6
	},
	roleIcon: {
		height: size.s_20,
		width: size.s_20,
		marginRight: size.s_8
	}
});
