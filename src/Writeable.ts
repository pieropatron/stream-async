"use strict";

import { Writable, WritableOptions } from "stream";

import {SeparateOptions, AssignAsyncOpts, CheckWritev} from './lib-utils';

const WRAP_KEYS = new Set(["destroy", "final", "write", "writev"]);

export interface WritableAsyncOptions<T> extends WritableOptions {
	destroy?(this: WriteableAsync<T>, error: Error | null): Promise<void>,
	final?(this: WriteableAsync<T>): Promise<void>,
	write?(this: WriteableAsync<T>, chunk: T, encoding?: BufferEncoding): Promise<void>,
	writev?(this: WriteableAsync<T>, chunks: { chunk: T; encoding?: BufferEncoding; }[]): void
}

export class WriteableAsync<T> extends Writable {
	public _destroyAsync?(this: WriteableAsync<T>, error: Error | null): Promise<void>;
	public _finalAsync?(this: WriteableAsync<T>): Promise<void>;
	public _writeAsync?(this: WriteableAsync<T>, chunk: T, encoding?: BufferEncoding): Promise<void>;
	public _writevAsync?(this: WriteableAsync<T>, chunks: { chunk: T, encoding?: BufferEncoding }[]): Promise<void>;
	public writableNeedDrain: boolean;

	constructor(options: WritableAsyncOptions<T>){
		const { async_opts, super_opts } = SeparateOptions<WritableAsyncOptions<T>>(options, WRAP_KEYS);
		super(super_opts);
		AssignAsyncOpts(this, async_opts, WRAP_KEYS);
		CheckWritev.call(this);
	}
}
