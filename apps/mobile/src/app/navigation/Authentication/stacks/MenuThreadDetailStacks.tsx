import { size, useTheme } from '@mezon/mobile-ui';
import { TransitionSpecs, createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';
import MuteCategoryDetailModal from '../../../components/MuteCategoryDetailModal';
import MuteThreadDetailModal from '../../../components/MuteThreadDetailModal';
import CreateThreadModal from '../../../components/ThreadDetail';
import CreateThreadForm from '../../../components/ThreadDetail/CreateThreadForm';
import MenuThreadDetail from '../../../components/ThreadDetail/MenuThreadDetail';
import { APP_SCREEN } from '../../ScreenTypes';

// eslint-disable-next-line no-empty-pattern
export const MenuThreadDetailStacks = ({}: any) => {
	const { themeValue } = useTheme();
	const Stack = createStackNavigator();
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
				headerShadowVisible: false,
				gestureEnabled: Platform.OS === 'ios',
				headerLeftLabelVisible: false,
				headerBackTitleVisible: false,
				headerTintColor: themeValue.text,
				transitionSpec: {
					open: TransitionSpecs.TransitionIOSSpec,
					close: TransitionSpecs.TransitionIOSSpec
				},
				headerTitleStyle: {
					color: themeValue.textStrong
				},
				headerStyle: {
					backgroundColor: themeValue.primary
				},
				headerStatusBarHeight: Platform.OS === 'android' ? 0 : undefined,
				headerLeftContainerStyle: Platform.select({
					ios: {
						left: size.s_6
					}
				}),
				cardStyle: { backgroundColor: 'transparent' },
				animationEnabled: Platform.OS === 'ios'
			}}
		>
			<Stack.Screen
				name={APP_SCREEN.MENU_THREAD.BOTTOM_SHEET}
				component={MenuThreadDetail}
				options={{
					headerShown: false
				}}
			/>
			<Stack.Screen name={APP_SCREEN.MENU_THREAD.CREATE_THREAD} component={CreateThreadModal} />
			<Stack.Screen name={APP_SCREEN.MENU_THREAD.CREATE_THREAD_FORM_MODAL} component={CreateThreadForm} />
			<Stack.Screen name={APP_SCREEN.MENU_THREAD.MUTE_THREAD_DETAIL_CHANNEL} component={MuteThreadDetailModal} />
			<Stack.Screen name={APP_SCREEN.MENU_THREAD.MUTE_CATEGORY_DETAIL} component={MuteCategoryDetailModal} />
		</Stack.Navigator>
	);
};
