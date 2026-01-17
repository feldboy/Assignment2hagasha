import mongoose, { Document } from 'mongoose';
export interface IComment extends Document {
    post: mongoose.Types.ObjectId;
    content: string;
    sender: string;
    owner: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IComment, {}, {}, {}, mongoose.Document<unknown, {}, IComment, {}, mongoose.DefaultSchemaOptions> & IComment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IComment>;
export default _default;
//# sourceMappingURL=Comment.d.ts.map