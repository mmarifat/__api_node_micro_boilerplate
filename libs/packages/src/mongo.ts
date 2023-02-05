import { PipelineStage, Types } from 'mongoose';
import { ENUMS } from '@packages/enums';
import CollectionEnum = ENUMS.PROJECT.CollectionEnum;

export const withoutDeletedMongoose = {
    deletedAt: null,
};
export const onlyDeletedMongoose = {
    deletedAt: { $ne: null },
};

export const withoutDeletedAggregate = {
    $match: withoutDeletedMongoose,
};
export const onlyDeletedAggregate = {
    $match: onlyDeletedMongoose,
};

export const escapeRegex = (text = ''): string => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

export const en_US_Collation = {
    collation: {
        locale: 'en_US',
    },
};

export const stringToMongoId = (mongoIdAsString: string | Types.ObjectId): Types.ObjectId =>
    <Types.ObjectId>Types.ObjectId.createFromHexString(mongoIdAsString.toString());

export const posfAggregate = (
    page: number,
    limit: number,
    sort: string,
    order: string,
    searchValue: string,
    searchableFields: string[],
): Array<PipelineStage> => {
    const pipeline: Array<PipelineStage> = [withoutDeletedAggregate];
    if (searchValue && searchableFields.length) {
        const $match = {
            $or: [],
        };
        const regex = new RegExp(escapeRegex(searchValue), 'gi');
        if (regex) {
            for (const field of searchableFields) {
                $match.$or.push({
                    [field]: regex,
                });
            }
            pipeline.push({ $match });
        }
    }

    let $sort: any = { updatedAt: -1 };
    if (sort && sort !== 'undefined') {
        $sort = { [sort]: -1 };
        if (order && order !== 'undefined') {
            $sort = { [sort]: order.toUpperCase() === 'DESC' ? -1 : 1 };
        }
    }
    pipeline.push({ $sort });

    if (page > 0 && limit > 0) {
        pipeline.push({ $skip: (page - 1) * limit });
        pipeline.push({ $limit: limit });
    }
    return pipeline;
};

export const userToProfileAggregate: Array<PipelineStage> = [
    {
        $lookup: {
            from: CollectionEnum.PROFILES,
            localField: 'profile',
            foreignField: '_id',
            as: 'profile',
        },
    },
    {
        $unwind: '$profile',
    },
    {
        $project: {
            password: 0,
            hashedRt: 0,
        },
    },
];
