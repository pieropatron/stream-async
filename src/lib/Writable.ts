import { Writable, WritableOptions } from "stream";

import {SeparateOptions, AssignAsyncOpts, CheckWritev} from './lib-utils';

const WRAP_KEYS = new Set(["destroy", "final", "write", "writev"]);

export interface WritableAsyncOptions<T = any> extends WritableOptions {
	destroy?(this: WritableAsync<T>, error: Error | null): Promise<void>,
	final?(this: WritableAsync<T>): Promise<void>,
	write?(this: WritableAsync<T>, chunk: T, encoding?: BufferEncoding): Promise<void>,
	writev?(this: WritableAsync<T>, chunks: { chunk: T; encoding?: BufferEncoding; }[]): void
}

export class WritableAsync<T = any> extends Writable {
	public _destroyAsync?(error: Error | null): Promise<void>;
	public _finalAsync?(): Promise<void>;
	public _writeAsync?(chunk: T, encoding?: BufferEncoding): Promise<void>;
	public _writevAsync?(chunks: { chunk: T, encoding?: BufferEncoding }[]): Promise<void>;
	public writableNeedDrain: boolean;

	constructor(options: WritableAsyncOptions<T>){
		const { async_opts, super_opts } = SeparateOptions<WritableAsyncOptions<T>>(options, WRAP_KEYS);
		super(super_opts);
		AssignAsyncOpts(this, async_opts, WRAP_KEYS);
		CheckWritev.call(this);
	}
}
