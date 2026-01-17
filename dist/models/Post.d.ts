import mongoose, { Document } from 'mongoose';
export interface IPost extends Document {
    title: string;
    content: string;
    sender: string;
    owner: mongoose.Types.ObjectId;
    createdAt: Date;
}
declare const _default: mongoose.Model<IPost, {}, {}, {}, mongoose.Document<unknown, {}, IPost, {}, mongoose.DefaultSchemaOptions> & IPost & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPost>;
export default _default;
//# sourceMappingURL=Post.d.ts.map