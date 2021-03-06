import { DefaultWidgetBaseInterface, DNode } from '@dojo/framework/core/interfaces';

import * as parser from '../parser';
import { INLINE_C_MATCHER } from '../inline-c';
import * as d from '@dojo/framework/core/vdom';
import * as fs from 'fs-extra';
import * as path from 'path';
import { v } from '@dojo/framework/core/vdom';

export const regionName = 'RegionName';

const regionContents = `	protected render() {
		const div = <div>Test content</div>;

		// @start-region renderReturn
		return {div};
		// @end-region renderReturn
	}`;

const regionContentsCommentsStripped = `	protected render() {
		const div = <div>Test content</div>;

		return {div};
	}`;

const regionContentsLeftAlligned = `protected render() {
	const div = <div>Test content</div>;

	return {div};
}`;

export const fromMarkdownOutput: DNode<DefaultWidgetBaseInterface> = v(
	'pre',
	{ class: 'language-tsx', key: 'compiled-26' },
	[
		v('code', { class: 'language-tsx', key: 'compiled-25' }, [
			v('span', { class: 'token keyword', key: 'compiled-3' }, ['protected']),
			' ',
			v('span', { class: 'token function', key: 'compiled-4' }, ['render']),
			v('span', { class: 'token punctuation', key: 'compiled-5' }, ['(']),
			v('span', { class: 'token punctuation', key: 'compiled-6' }, [')']),
			' ',
			v('span', { class: 'token punctuation', key: 'compiled-7' }, ['{']),
			'\n    ',
			v('span', { class: 'token keyword', key: 'compiled-8' }, ['const']),
			' div ',
			v('span', { class: 'token operator', key: 'compiled-9' }, ['=']),
			' ',
			v('span', { class: 'token tag', key: 'compiled-13' }, [
				v('span', { class: 'token tag', key: 'compiled-11' }, [
					v('span', { class: 'token punctuation', key: 'compiled-10' }, ['<']),
					'div'
				]),
				v('span', { class: 'token punctuation', key: 'compiled-12' }, ['>'])
			]),
			v('span', { class: 'token plain-text', key: 'compiled-14' }, ['Test content']),
			v('span', { class: 'token tag', key: 'compiled-18' }, [
				v('span', { class: 'token tag', key: 'compiled-16' }, [
					v('span', { class: 'token punctuation', key: 'compiled-15' }, ['</']),
					'div'
				]),
				v('span', { class: 'token punctuation', key: 'compiled-17' }, ['>'])
			]),
			v('span', { class: 'token punctuation', key: 'compiled-19' }, [';']),
			'\n\n    ',
			v('span', { class: 'token keyword', key: 'compiled-20' }, ['return']),
			' ',
			v('span', { class: 'token punctuation', key: 'compiled-21' }, ['{']),
			'div',
			v('span', { class: 'token punctuation', key: 'compiled-22' }, ['}']),
			v('span', { class: 'token punctuation', key: 'compiled-23' }, [';']),
			'\n',
			v('span', { class: 'token punctuation', key: 'compiled-24' }, ['}']),
			'\n'
		])
	]
);

const region = `	// @start-region RegionName
${regionContents}
	// @end-region RegionName`;

const mockFileContents = `import { WidgetBase } from '@dojo/framework/core/WidgetBase';
import { tsx } from '@dojo/framework/core/vdom';

export default class App extends WidgetBase {
${region}
}
`;

const mockFileContentsNoRegions = `import { WidgetBase } from '@dojo/framework/core/WidgetBase';
import { tsx } from '@dojo/framework/core/vdom';

export default class App extends WidgetBase {
${regionContentsLeftAlligned}
}
`;

describe('region parser', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('should extract region', () => {
		const existsSyncStub = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
		const readFileSyncStub = jest.spyOn(fs, 'readFileSync').mockReturnValue(mockFileContents);
		const mockW = jest.spyOn(d, 'w');

		const lefAlignStub = jest.spyOn(parser, 'leftAlign').mockReturnValue(regionContentsLeftAlligned.split('\n'));
		const stripRegionCommentsStub = jest
			.spyOn(parser, 'stripRegionComments')
			.mockReturnValue(regionContentsCommentsStripped.split('\n'));

		const type = 'docs-codeblock';
		const props: any = { path: 'path/to/file' };
		const propsWithRegion: any = { ...props, region: regionName };
		const propsWithTS: any = { ...propsWithRegion, ...{ language: 'ts' } };
		const propsWithTSX: any = { ...propsWithRegion, ...{ language: 'tsx' } };
		const propsWithTSWithoutRegion: any = { ...props, ...{ region: undefined, language: 'ts' } };

		// Proper run with language provided
		parser.regionBuilder(type, propsWithTSX);

		expect(stripRegionCommentsStub).toBeCalledTimes(1);
		expect(stripRegionCommentsStub).nthCalledWith(
			1,
			regionContents.split('\n'),
			INLINE_C_MATCHER.regionCommentMatcher
		);

		expect(lefAlignStub).toBeCalledTimes(1);
		expect(lefAlignStub).toHaveBeenCalledWith(regionContentsCommentsStripped.split('\n'));

		expect(mockW).toHaveBeenCalledWith(type, propsWithTSX, [fromMarkdownOutput]);

		// Proper run without language provided
		parser.regionBuilder(type, propsWithRegion);
		expect(mockW).toBeCalledTimes(2);
		expect(mockW.mock.calls[1][1]).toEqual(propsWithTS);

		// Proper run without region provided
		parser.regionBuilder(type, props);
		expect(mockW).toBeCalledTimes(3);
		expect(mockW.mock.calls[2][1]).toEqual(propsWithTSWithoutRegion);

		lefAlignStub.mockRestore();
		stripRegionCommentsStub.mockRestore();
		existsSyncStub.mockRestore();
		readFileSyncStub.mockRestore();
	});

	it('should display error message when region or file is not found', () => {
		const resolveStub = jest.spyOn(path, 'resolve').mockReturnValueOnce('content/examples/path/to/file');

		const existsSyncStub = jest
			.spyOn(fs, 'existsSync')
			.mockReturnValueOnce(true)
			.mockReturnValueOnce(false)
			.mockReturnValue(true);

		const readFileSyncStub = jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(mockFileContentsNoRegions);

		const mockV = jest.spyOn(d, 'v');

		const type = 'docs-codeblock';
		const props: any = { path: 'path/to/file', region: regionName, language: 'tsx' };

		parser.regionBuilder(type, props);
		expect(existsSyncStub).toBeCalledTimes(1);
		expect(readFileSyncStub).toBeCalledTimes(1);
		expect(mockV).toBeCalledTimes(1);
		expect(mockV.mock.calls[0]).toEqual(['p', ['Could not load region']]);

		parser.regionBuilder(type, props);
		expect(existsSyncStub).toBeCalledTimes(2);
		expect(readFileSyncStub).toBeCalledTimes(1);
		expect(mockV).toBeCalledTimes(2);
		expect(mockV.mock.calls[1]).toEqual(['p', ['Could not load file']]);

		parser.regionBuilder(type, {});
		expect(existsSyncStub).toBeCalledTimes(2);
		expect(readFileSyncStub).toBeCalledTimes(1);
		expect(mockV).toBeCalledTimes(3);
		expect(mockV.mock.calls[2]).toEqual(['p', ['Invalid file path']]);

		parser.regionBuilder(type, { ...props, ...{ language: 'dummy' } });
		expect(existsSyncStub).toBeCalledTimes(3);
		expect(readFileSyncStub).toBeCalledTimes(1);
		expect(mockV).toBeCalledTimes(4);
		expect(mockV.mock.calls[3]).toEqual(['p', ['Could not recognize language']]);

		resolveStub.mockRestore();
	});

	it('should left strip region comments from output', () => {
		const output = parser.stripRegionComments(regionContents.split('\n'), INLINE_C_MATCHER.regionCommentMatcher);

		expect(output).toEqual(regionContentsCommentsStripped.split('\n'));
	});

	it('should left align region', () => {
		const output = parser.leftAlign(regionContentsCommentsStripped.split('\n'));

		expect(output).toEqual(regionContentsLeftAlligned.split('\n'));

		const output2 = parser.leftAlign(regionContentsLeftAlligned.split('\n'));

		expect(output2).toEqual(regionContentsLeftAlligned.split('\n'));
	});
});
