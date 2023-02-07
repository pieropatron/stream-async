# stream-async
nodejs streams using async/await functions

Idea of this project is to have nodejs streams classes (mostly `Transform` and `Writable`), which could be configured to use `async/await` methods instead of standard methods, having callbacks. I like very much of streams which is really powerfull tool, but I also like `async/await` syntacsys too. So, from the beginning of my "streaming way" I had a dream to combine these things. At the moment, streams sugnificantly grew up in this terms and we have even stream.promises functions. But, unfortunately, as for stream methods, such as `destroy`, `final`, `flush`, `transform`, `write`, `writev` we still have callbacks, as I know. As alternative, we can also use Generators, but, to be honest, it looks like not comfortable for me and I can't understand how they can be used for batch arrays of chunks as `writev` does, which is really usefull functionality according to my expirience. Anyway, even if this is "bicycle", I'm glad to introduce it.

# Install
`npm install https://github.com/pieropatron/stream-async.git`

# Import
``` javascript
const { ReadableAsync, TransformAsync, WritableAsync, pipeline } = require('@pieropatron/stream-async'); // nothing new, folks
```

# ReadableAsync
This class doesn't have some extra change in options, it requires same options as `stream.Readable` with exception of that `read` method option is not mandatory. By default it equals to noop function: `()=>{}`.

For TypeScript and JSDoc also able to determine type of options of ReadableAsync.

``` TypeScript
const rs = new ReadableAsync<{user: string}>();
rs.push({user: "John Dow"});
```

Additionally, what is new here are following methods:

* ```waitDrain(): Promise<void>```. This method attended to use for wait of "drain" event of following streams in pipeline. When we pushing information to Readable, push method can return false, which in 2 words means, that we pushing faster, then information processing in pipeline. If we'll ignore this, it possible to have memory problems for node. So, to avoid this, it is better to wait a bit for a next stream in pipeline will ready to get more data (it will emit "drain" event to inform us about this). So, safe use of push is so:

``` javascript
if (!Readable.push(data)) await Readable.waitDrain();
```

* ```pushAsync(data: <OptionsType>): Promise<void>``` In fact this is tiny helper function, which code you can see above.

Please, be aware, that this is extra functionality, based on experimental studing of some "private" properties, which was tested on nodejs version 14. And it probably can work instable or even not be workable for another versions.


# TransformAsync

TransformAsync also has types: "Topts" for options, "Tresult" for transform results.

For the goals of the project, following options of stream.Tranform were wrapped:

``` TypeScript
const ts = new TransformAsync<Topts, Tresult>(
	destroy?(error: Error | null): Promise<void>,
	final?(): Promise<void>,
	flush?(): Promise<Tresult|undefined>,
	transform?(chunk: Topts, encoding?: BufferEncoding): Promise<Tresult | undefined>,
	write?(chunk: Topts, encoding?: BufferEncoding): Promise<void>,
	writev?(chunks: { chunk: Topts; encoding?: BufferEncoding; }[]): void
);
```

Child classes are able to has following methods:

``` TypeScript
class MyTransform extends TransformAsync {
	_destroyAsync?(error: Error | null): Promise<void>;
	_finalAsync?(): Promise<void>;
	_flushAsync?(): Promise<Tresult | undefined>;
	_transformAsync?(chunk: Topts, encoding?: BufferEncoding): Promise<Tresult | undefined>;
	_writeAsync?(chunk: Topts, encoding?: BufferEncoding): Promise<void>;
	_writevAsync?(chunks: { chunk: Topts, encoding?: BufferEncoding }[]): Promise<void>;
}
```

waitDrain and pushAsync are also parts of TransformAsync.

## WritableAsync
For WritableAsync we can also declare type of processing items.

Example of create with wrapped stream.Writable options:

``` TypeScript
const ws = new WritableAsync<T>({
	destroy?( error: Error | null): Promise<void>,
	final?(): Promise<void>,
	write?(chunk: T, encoding?: BufferEncoding): Promise<void>,
	writev?(chunks: { chunk: T; encoding?: BufferEncoding; }[]): void
});
```

Additional methods for child classes:

``` TypeScript
class MyWritable extends WritableAsync {
	_destroyAsync?(error: Error | null): Promise<void>;
	_finalAsync?(): Promise<void>;
	_writeAsync?(chunk: T, encoding?: BufferEncoding): Promise<void>;
	_writevAsync?(chunks: { chunk: T, encoding?: BufferEncoding }[]): Promise<void>;
}
```

As Writable supposes to be used at final-stage in pipeline, it doesn't need to have waitDrain and pushAsync methods.

## pipeline
If your version of Nodejs has no stream.promises and you are so lazy as me to doing this every time:

``` TypeScript
import { promisify } from "util";
import stream from "stream";
const pipeline = promisify(stream.pipeline);
```

You can use promised "pipeline" from this lib.

Well, that's all what we have here. Hope it will be useful for you.
