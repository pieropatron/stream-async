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

export class TransformAsync<Topts = any, Tresult = Topts> extends Transform {
	_destroyAsync?(error: Error | null): Promise<void>;
	_finalAsync?(): Promise<void>;
	_flushAsync?(): Promise<Tresult | undefined>;
	_transformAsync?(chunk: Topts, encoding?: BufferEncoding): Promise<Tresult | undefined>;
	_writeAsync?(chunk: Topts, encoding?: BufferEncoding): Promise<void>;
	_writevAsync?(chunks: { chunk: Topts, encoding?: BufferEncoding }[]): Promise<void>;

	constructor(options: TransformAsyncOptions<Topts, Tresult>){
		const { async_opts, super_opts } = SeparateOptions<TransformAsyncOptions<Topts, Tresult>>(options, WRAP_KEYS);
		super(super_opts);
		AssignAsyncOpts(this, async_opts, WRAP_KEYS);
		CheckWritev.call(this);
	}

	push(chunk: Tresult|null, encoding?: BufferEncoding){ return super.push(chunk, encoding); }

	pushAsync(chunk: Tresult|null, encoding?: BufferEncoding): Promise<boolean>{
		return pushAsync.call(this, chunk, encoding);
	}

	waitDrain(): Promise<void>{ return waitDrain.call(this); }
}

// no need to override in fact
TransformAsync.prototype.push = Transform.prototype.push;
