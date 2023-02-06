import { promisify } from "util";
import stream from "stream";

export {ReadableAsync} from './Readable';
export {WritableAsyncOptions, WriteableAsync} from './Writeable';
export {TransformAsyncOptions, TransformAsync} from './Transform';

export const pipeline = stream.promises?.pipeline ? stream.promises.pipeline : promisify(stream.pipeline);
