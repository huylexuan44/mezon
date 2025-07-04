import { useTheme } from '@mezon/mobile-ui';
import { createStackNavigator } from '@react-navigation/stack';
import ShopScreen from '../../../screens/Shop';
import { APP_SCREEN } from '../../ScreenTypes';

const Stack = createStackNavigator();

export function ShopStack({}: any) {
	const { themeValue } = useTheme();

	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
				headerStyle: {
					backgroundColor: themeValue.primary
				}
			}}
		>
			<Stack.Screen name={APP_SCREEN.SHOP.HOME} component={ShopScreen} />
		</Stack.Navigator>
	);
}
