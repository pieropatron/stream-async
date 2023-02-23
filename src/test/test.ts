import {ReadableAsync, TransformAsync, WritableAsync, pipeline} from '../index';

type OPTS = { i: number };
type RES = { J: number };

const test_common = async (ar: RES[], rs: ReadableAsync<OPTS>, ts: TransformAsync<OPTS, RES>, ws: WritableAsync<RES>)=>{
	const count = 100;
	await Promise.all([
		pipeline(rs, ts, ws),
		(async () => {
			for (let i = 0; i < count; i++) {
				if (!rs.push({ i })) {
					await rs.waitDrain();
				}
			}
			rs.push(null);
		})()
	]);
	expect(ar.length).toEqual(count);
	expect(ar[0].J).toEqual(0);
	expect(ar[count - 1].J).toEqual(count - 1);
};

async function ts_writev(this: TransformAsync<OPTS, RES>, _archunks: {chunk: OPTS}[]){
	for (let i = 0; i < _archunks.length; i++) {
		const chunk = _archunks[i].chunk;
		if (!this.push({ J: chunk.i })) {
			await this.waitDrain();
		}
	}
}

async function ws_write(ar: RES[], chunk:RES) {
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			ar.push(chunk);
			resolve();
		}, 10);
	});
}

describe("stream tests", ()=>{
	test('options', async ()=>{
		const rs = new ReadableAsync<OPTS>({ objectMode: true });
		const ts = new TransformAsync<OPTS, RES>({
			highWaterMark: 5,
			objectMode: true,
			writev: ts_writev
		});

		const ar: RES[] = [];
		const ws = new WritableAsync<RES>({
			objectMode: true,
			write: ws_write.bind(null, ar)
		});

		await test_common(ar, rs, ts, ws);
	});

	it('classes', async ()=>{
		const rs = new ReadableAsync<OPTS>({ objectMode: true });
		class TS extends TransformAsync<OPTS, RES> {
			constructor() {
				super({
					highWaterMark: 5,
					objectMode: true
				});
			}

			async _writevAsync(chunks) {
				await ts_writev.call(this, chunks);
			}
		}

		const ar: RES[] = [];

		class WS extends WritableAsync<RES> {
			constructor() {
				super({
					objectMode: true
				});
			}

			async _writeAsync(chunk: RES) {
				await ws_write.call(this, ar, chunk);
			}
		}

		await test_common(ar, rs, new TS(), new WS());
	});
});
