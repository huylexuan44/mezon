import { useEscapeKey } from '@mezon/core';
import { categoriesActions, checkDuplicateCategoryInClan, selectCurrentClanId, useAppDispatch } from '@mezon/store';
import { ICategory, KEY_KEYBOARD, ValidateSpecialCharacters } from '@mezon/utils';
import { unwrapResult } from '@reduxjs/toolkit';
import { ApiUpdateCategoryDescRequest } from 'mezon-js/api.gen';
import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import ModalSaveChanges from '../ClanSettings/ClanSettingOverview/ModalSaveChanges';

interface IOverViewSettingProps {
	category: ICategory | null;
	onClose: () => void;
}

const OverviewSetting: React.FC<IOverViewSettingProps> = ({ category, onClose }) => {
	const currentClanId = useSelector(selectCurrentClanId);
	const [categoryNameInit, setCategoryNameInit] = useState(category?.category_name || '');
	const [categoryName, setCategoryName] = useState(categoryNameInit);
	const [checkValidate, setCheckValidate] = useState('');
	const hasChanged = useMemo(() => {
		return categoryName !== category?.category_name;
	}, [categoryName, category?.category_name]);
	const dispatch = useAppDispatch();

	const messages = {
		INVALID_NAME: `Please enter a valid category name (max 64 characters, only words, numbers, _ or -).`,
		DUPLICATE_NAME: `The category  name already exists in the clan . Please enter another name.`
	};

	const debouncedSetCategoryName = useDebouncedCallback(async (value: string) => {
		if (categoryNameInit && value.trim() === categoryNameInit.trim()) {
			setCheckValidate('');
			return;
		}

		const regex = ValidateSpecialCharacters();
		if (regex.test(value)) {
			await dispatch(
				checkDuplicateCategoryInClan({
					categoryName: value.trim(),
					clanId: currentClanId ?? ''
				})
			)
				.then(unwrapResult)
				.then((result) => {
					if (result) {
						setCheckValidate(messages.DUPLICATE_NAME);
						return;
					}
					setCheckValidate('');
				});
			return;
		}

		setCheckValidate(messages.INVALID_NAME);
	}, 300);

	const handleChangeCategoryName = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setCategoryName(value);
			debouncedSetCategoryName(value);
		},
		[debouncedSetCategoryName]
	);

	const handleSave = () => {
		setCategoryNameInit(categoryName);
		const request: ApiUpdateCategoryDescRequest = {
			category_id: category?.category_id || '',
			category_name: categoryName,
			ClanId: currentClanId ?? ''
		};
		dispatch(
			categoriesActions.updateCategory({
				clanId: currentClanId ?? '',
				request: request
			})
		);
	};

	const handleReset = () => {
		setCategoryName(categoryNameInit);
	};

	useEscapeKey(() => {
		if (hasChanged) {
			handleReset();
		} else {
			onClose();
		}
	});

	const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.keyCode === KEY_KEYBOARD.ENTER && !checkValidate) {
			handleSave();
		}
	};

	return (
		<>
			<div className="flex flex-1 flex-col">
				<h3 className="text-xs font-bold text-theme-primary mb-2">Category Name</h3>
				<div className="w-full">
					<input
						type="text"
						value={categoryName}
						onChange={handleChangeCategoryName}
						className="dark:text-[#B5BAC1] text-textLightTheme outline-none w-full h-10 p-[10px] dark:bg-bgInputDark bg-bgLightModeSecond text-base rounded placeholder:text-sm"
						placeholder="Enter your category name here..."
						maxLength={Number(process.env.NX_MAX_LENGTH_NAME_ALLOWED)}
						onKeyDown={handlePressEnter}
					/>
				</div>
				{checkValidate && <p className="text-[#e44141] text-xs italic font-thin">{checkValidate}</p>}
			</div>

			{hasChanged && !checkValidate && <ModalSaveChanges onSave={handleSave} onReset={handleReset} />}
		</>
	);
};

export default OverviewSetting;
