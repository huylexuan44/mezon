import type { IGif, IGifCategory } from '@mezon/utils';
import type { EntityState } from '@reduxjs/toolkit';
import { createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';

export const GIFS_FEATURE_KEY = 'gifs';

export interface GifCategoriesEntity extends IGifCategory {
	id: string;
}

export interface GifEntity extends IGif {
	id: string;
}

export interface GifCategoriesResponse {
	locale: string;
	tags: GifCategoriesEntity[];
}

export const gifsAdapter = createEntityAdapter<GifCategoriesEntity>({
	selectId: (emo: GifCategoriesEntity) => emo.id || emo.path || ''
} as any);

export interface GifsState extends EntityState<GifCategoriesEntity, string> {
	loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
	error?: string | null;
	dataGifsSearch: GifEntity[];
	dataGifsFeatured: GifEntity[];
	trendingClickingStatus: boolean;
	categoriesStatus: boolean;
	buttonArrowBackStatus: boolean;
}
export const initialGifsState: GifsState = {
	...gifsAdapter.getInitialState(),
	loadingStatus: 'not loaded',
	error: null,
	dataGifsSearch: [],
	dataGifsFeatured: [],
	trendingClickingStatus: false,
	categoriesStatus: false,
	buttonArrowBackStatus: false
};

const apiKey = process.env.NX_CHAT_APP_API_TENOR_KEY;
const clientKey = process.env.NX_CHAT_APP_API_CLIENT_KEY_CUSTOM;
const limit = 30;

export const gifsSlice = createSlice({
	name: GIFS_FEATURE_KEY,
	initialState: initialGifsState,
	reducers: {
		add: gifsAdapter.addOne,
		remove: gifsAdapter.removeOne,

		setClickedTrendingGif: (state, action) => {
			state.trendingClickingStatus = action.payload;
		},
		setShowCategories: (state, action) => {
			state.categoriesStatus = action.payload;
		},
		setButtonArrowBack: (state, action) => {
			state.buttonArrowBackStatus = action.payload;
		}
	}
});

export const gifsReducer = gifsSlice.reducer;

export const gifsActions = {
	...gifsSlice.actions
};

const { selectAll } = gifsAdapter.getSelectors();

export const getGifsState = (rootState: { [GIFS_FEATURE_KEY]: GifsState }): GifsState => rootState[GIFS_FEATURE_KEY];

export const selectAllgifCategory = createSelector(getGifsState, selectAll);

export const selectGifsDataSearch = createSelector(getGifsState, (state: GifsState) => state.dataGifsSearch);

export const selectLoadingStatusGifs = createSelector(getGifsState, (state: GifsState) => state.loadingStatus);

export const selectDataGifsFeatured = createSelector(getGifsState, (state: GifsState) => state.dataGifsFeatured);

export const selectTrendingClickingStatus = createSelector(getGifsState, (state: GifsState) => state.trendingClickingStatus);

export const selectCategoriesStatus = createSelector(getGifsState, (state: GifsState) => state.categoriesStatus);

export const selectButtonArrowBackStatus = createSelector(getGifsState, (state: GifsState) => state.buttonArrowBackStatus);
