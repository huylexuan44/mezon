import { FloatButton } from '@mezon/ui';
import React from 'react';

type MentionFloatButtonProps = {
	onClick: () => void;
};

export const MentionFloatButton = React.memo<MentionFloatButtonProps>(({ onClick }) => {
	return <FloatButton content={'New mention'} backgroundColor={'#DA373C'} textColor={'white'} onClick={onClick} className={'uppercase'} />;
});
