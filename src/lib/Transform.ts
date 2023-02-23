"use strict";

import { Transform, TransformOptions } from "stream";

import {SeparateOptions, AssignAsyncOpts, CheckWritev, waitDrain, pushAsync} from './lib-utils';

const WRAP_KEYS = new Set(["destroy", "final", "flush", "transform", "write", "writev"]);

export interface TransformAsyncOptions<Topts, Tresult> extends TransformOptions {
	destroy?(this: TransformAsync<Topts, Tresult>, error: Error | null): Promise<void>,
	final?(this: TransformAsync<Topts, Tresult>): Promise<void>,
	flush?(this: TransformAsync<Topts, Tresult>): Promise<Tresult|undefined>,
	transform?(this: TransformAsync<Topts, Tresult>, chunk: Topts, encoding?: BufferEncoding): Promise<Tresult | undefined>,
	write?(this: TransformAsync<Topts, Tresult>, chunk: Topts, encoding?: BufferEncoding): Promise<void>,
	writev?(this: TransformAsync<Topts, Tresult>, chunks: { chunk: Topts; encoding?: BufferEncoding; }[]): void
}

export class TransformAsync<Topts, Tresult> extends Transform {
	public _destroyAsync?(this: TransformAsync<Topts, Tresult>, error: Error | null): Promise<void>;
	public _finalAsync?(this: TransformAsync<Topts, Tresult>): Promise<void>;
	public _flushAsync?(this: TransformAsync<Topts, Tresult>): Promise<Tresult | undefined>;
	public _transformAsync?(this: TransformAsync<Topts, Tresult>, chunk: Topts, encoding?: BufferEncoding): Promise<Tresult | undefined>;
	public _writeAsync?(this: TransformAsync<Topts, Tresult>, chunk: Topts, encoding?: BufferEncoding): Promise<void>;
	public _writevAsync?(this: TransformAsync<Topts, Tresult>, chunks: { chunk: Topts, encoding?: BufferEncoding }[]): Promise<void>;
	public push: (chunk: Tresult|null, encoding?: BufferEncoding | undefined) => boolean;
	public pushAsync: (chunk: Tresult|null, encoding?: BufferEncoding | undefined) => Promise<boolean>;
	public waitDrain: () => Promise<void>;

	constructor(options: TransformAsyncOptions<Topts, Tresult>){
		const { async_opts, super_opts } = SeparateOptions<TransformAsyncOptions<Topts, Tresult>>(options, WRAP_KEYS);
		super(super_opts);
		AssignAsyncOpts(this, async_opts, WRAP_KEYS);
		CheckWritev.call(this);
	}
}

TransformAsync.prototype.pushAsync = pushAsync;
TransformAsync.prototype.waitDrain = waitDrain;
