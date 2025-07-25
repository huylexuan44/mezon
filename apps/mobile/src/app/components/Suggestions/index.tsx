import { debounce } from '@mezon/mobile-components';
import { size } from '@mezon/mobile-ui';
import {
	emojiSuggestionActions,
	getStore,
	selectAllChannels,
	selectAllEmojiSuggestion,
	selectAllHashtagDm,
	selectCurrentUserId,
	useAppDispatch
} from '@mezon/store-mobile';
import { ID_MENTION_HERE, MentionDataProps, compareObjects, normalizeString } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { FC, memo, useEffect, useMemo, useState } from 'react';
import { LayoutAnimation, Pressable, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import SuggestItem from './SuggestItem';

export interface MentionSuggestionsProps {
	keyword?: string;
	onSelect: (user: MentionDataProps) => void;
	listMentions: MentionDataProps[];
	isEphemeralMode?: boolean;
}

const Suggestions: FC<MentionSuggestionsProps> = memo(({ keyword, onSelect, listMentions, isEphemeralMode }) => {
	const [listMentionData, setListMentionData] = useState([]);
	const filterMentionList = debounce(() => {
		if (!listMentions?.length) {
			setListMentionData([]);
			return;
		}
		LayoutAnimation.configureNext(LayoutAnimation.create(200, LayoutAnimation.Types['easeInEaseOut'], LayoutAnimation.Properties['opacity']));
		const mentionSearchText = keyword?.toLocaleLowerCase();

		const filterMatchedMentions = (mentionData: MentionDataProps) => {
			const matchesKeyword =
				normalizeString(mentionData?.display)?.toLocaleLowerCase()?.includes(mentionSearchText) ||
				normalizeString(mentionData?.username)?.toLocaleLowerCase()?.includes(mentionSearchText);

			if (isEphemeralMode) {
				const store = getStore();
				const currentUserId = selectCurrentUserId(store.getState());
				return mentionData?.id !== ID_MENTION_HERE && !mentionData?.isRoleUser && mentionData?.id !== currentUserId && matchesKeyword;
			}

			return matchesKeyword;
		};

		const filteredUserMentions = listMentions
			.filter(filterMatchedMentions)
			.sort((a, b) => compareObjects(a, b, mentionSearchText, 'display', 'display'))
			.map((item) => ({
				...item,
				name: item?.display
			}));
		setListMentionData(filteredUserMentions || []);
	}, 300);

	useEffect(() => {
		filterMentionList();
	}, [keyword, listMentions]);

	const handleSuggestionPress = (user: MentionDataProps) => {
		onSelect(user as MentionDataProps);
	};
	return (
		<FlatList
			style={{ maxHeight: size.s_220 }}
			data={listMentionData}
			renderItem={({ item }) => {
				if (!item?.display) return <View />;
				return (
					<Pressable onPress={() => handleSuggestionPress(item)}>
						<SuggestItem
							isRoleUser={item?.isRoleUser}
							isDisplayDefaultAvatar={true}
							name={item?.display ?? ''}
							avatarUrl={item.avatarUrl}
							subText={item?.username}
							color={item?.color}
						/>
					</Pressable>
				);
			}}
			keyExtractor={(item, index) => `${item?.id}_${index}_mention_suggestion`}
			onEndReachedThreshold={0.1}
			keyboardShouldPersistTaps="handled"
			initialNumToRender={5}
			maxToRenderPerBatch={5}
			windowSize={15}
			updateCellsBatchingPeriod={10}
			decelerationRate={'fast'}
			disableVirtualization={true}
			removeClippedSubviews={true}
			getItemLayout={(_, index) => ({
				length: size.s_50,
				offset: size.s_50 * index,
				index
			})}
		/>
	);
});

export type ChannelsMention = {
	id: string;
	display: string;
	subText: string;
	name?: string;
};

export interface MentionHashtagSuggestionsProps {
	// readonly listChannelsMention?: ChannelsMention[];
	// channelId: string;
	keyword?: string;
	onSelect: (user: MentionDataProps) => void;
	directMessageId: string;
	mode: number;
}

const HashtagSuggestions: FC<MentionHashtagSuggestionsProps> = memo(({ keyword, onSelect, directMessageId, mode }) => {
	const channels = useSelector(selectAllChannels);
	const commonChannelDms = useSelector(selectAllHashtagDm);
	const [channelsMentionData, setChannelsMentionData] = useState([]);
	const listChannelsMention = useMemo(() => {
		let channelsMention = [];
		LayoutAnimation.configureNext(LayoutAnimation.create(200, LayoutAnimation.Types['easeInEaseOut'], LayoutAnimation.Properties['opacity']));
		if ([ChannelStreamMode.STREAM_MODE_DM].includes(mode)) {
			channelsMention = commonChannelDms;
		} else {
			channelsMention = channels;
		}
		return channelsMention?.map((item) => ({
			...item,
			id: item?.channel_id ?? '',
			display: item?.channel_label ?? '',
			subText: (item?.category_name || item?.clan_name) ?? '',
			name: item?.channel_label ?? ''
		}));
	}, [channels, commonChannelDms, mode]);

	const filterChannelsMention = debounce(() => {
		if (!listChannelsMention?.length) {
			setChannelsMentionData([]);
			return;
		}
		const filteredChannelsMention = listChannelsMention?.filter((item) => item?.name?.toLocaleLowerCase().includes(keyword?.toLocaleLowerCase()));
		setChannelsMentionData(filteredChannelsMention || []);
	}, 300);

	useEffect(() => {
		filterChannelsMention();
	}, [keyword, listChannelsMention]);

	const handleSuggestionPress = (channel: ChannelsMention) => {
		onSelect(channel);
	};

	return (
		<FlatList
			style={{ maxHeight: size.s_220 }}
			data={channelsMentionData}
			renderItem={({ item }) => (
				<Pressable onPress={() => handleSuggestionPress(item)}>
					<SuggestItem
						channelId={item?.id}
						channel={item}
						isDisplayDefaultAvatar={false}
						name={item?.display ?? ''}
						subText={(item as ChannelsMention).subText.toUpperCase()}
					/>
				</Pressable>
			)}
			keyExtractor={(_, index) => `${index}_hashtag_suggestion`}
			initialNumToRender={5}
			maxToRenderPerBatch={5}
			windowSize={5}
			onEndReachedThreshold={0.1}
			keyboardShouldPersistTaps="handled"
			removeClippedSubviews={true}
			getItemLayout={(_, index) => ({
				length: size.s_50,
				offset: size.s_50 * index,
				index
			})}
		/>
	);
});

export interface IEmojiSuggestionProps {
	keyword?: string;
	onSelect: (emoji: any) => void;
}

const EmojiSuggestion: FC<IEmojiSuggestionProps> = memo(({ keyword, onSelect }) => {
	const emojiListPNG = useSelector(selectAllEmojiSuggestion);
	const dispatch = useAppDispatch();
	const [formattedEmojiData, setFormattedEmojiData] = useState([]);

	const fetchEmojis = debounce(() => {
		if (!keyword) {
			setFormattedEmojiData([]);
			return;
		}
		LayoutAnimation.configureNext(LayoutAnimation.create(200, LayoutAnimation.Types['easeInEaseOut'], LayoutAnimation.Properties['opacity']));
		const filteredListEmoji = emojiListPNG
			?.filter((emoji) => emoji?.shortname && emoji?.shortname?.indexOf(keyword?.toLowerCase()) > -1)
			?.slice(0, 20);
		setFormattedEmojiData(filteredListEmoji);
	}, 300);

	useEffect(() => {
		fetchEmojis();
	}, [keyword, emojiListPNG]);

	const getEmojiIdFromSrc = (src) => {
		try {
			if (!src) return '';
			return src?.split('/')?.pop().split('.')[0];
		} catch (e) {
			return '';
		}
	};

	const handleEmojiSuggestionPress = (emoji: any) => {
		const emojiId = getEmojiIdFromSrc(emoji?.src) || emoji?.id;

		const emojiItemName = `:${emoji?.shortname?.split?.(':')?.join('')}:`;
		onSelect({
			...emoji,
			display: emojiItemName,
			name: emojiItemName
		});
		dispatch(
			emojiSuggestionActions.setSuggestionEmojiObjPicked({
				shortName: emojiItemName,
				id: emojiId
			})
		);
	};

	return (
		<FlatList
			style={{ maxHeight: size.s_220 }}
			data={formattedEmojiData}
			renderItem={({ item }) => (
				<Pressable onPress={() => handleEmojiSuggestionPress(item)}>
					<SuggestItem
						isDisplayDefaultAvatar={false}
						name={`:${item?.shortname?.split?.(':')?.join('')}:` ?? ''}
						emojiId={item?.id}
						emojiSrcUnlock={item?.src}
					/>
				</Pressable>
			)}
			initialNumToRender={5}
			maxToRenderPerBatch={5}
			windowSize={5}
			onEndReachedThreshold={0.1}
			keyboardShouldPersistTaps="handled"
			keyExtractor={(_, index) => `${index}_emoji_suggestion`}
			removeClippedSubviews={true}
			getItemLayout={(_, index) => ({
				length: size.s_50,
				offset: size.s_50 * index,
				index
			})}
		/>
	);
});

export { EmojiSuggestion, HashtagSuggestions, Suggestions };
