import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	listContainer: {
		height: '100%',
		paddingHorizontal: size.s_16
	},
	inputSearch: {
		borderRadius: size.s_8,
		height: size.s_36
	},
	btn: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.bgViolet,
		paddingVertical: size.s_14,
		borderRadius: 50,
		marginHorizontal: size.s_10,
		marginBottom: size.s_24
	},
	btnText: {
		color: Colors.white,
		fontSize: size.medium
	},
	memberAvatar: {
		height: size.s_34,
		width: size.s_34,
		borderRadius: 50,
		backgroundColor: Colors.bgGrayDark
	},
	groupAvatar: {
		backgroundColor: Colors.orange,
		width: size.s_34,
		height: size.s_34,
		borderRadius: 50,
		justifyContent: 'center',
		alignItems: 'center'
	}
});
