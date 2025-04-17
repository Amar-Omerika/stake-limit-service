/**
 * Creates a paginated query from Mongoose model and filter criteria
 * @param {Model} model - Mongoose model
 * @param {Object} filter - Filter criteria
 * @param {Object} options - Pagination and sorting options
 * @returns {Object} - Paginated results and metadata
 */
export async function paginate(model, filter = {}, options = {}) {
    // Extract pagination and sorting options with defaults
    const {
        page = 1,
        limit = 10,
        sortBy = '_id',
        sortOrder = 'asc',
        populate = null
    } = options;

    // Parse numeric values
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Build the query
    let query = model.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

    // Add population if specified
    if (populate) {
        query = query.populate(populate);
    }

    // Execute query
    const [data, totalCount] = await Promise.all([
        query.exec(),
        model.countDocuments(filter)
    ]);

    // Calculate metadata
    return {
        data,
        pagination: {
            total: totalCount,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(totalCount / limitNum),
            hasNext: pageNum < Math.ceil(totalCount / limitNum),
            hasPrev: pageNum > 1
        }
    };
}

/**
 * Builds a filter object based on query parameters
 * @param {Object} queryParams - Request query parameters
 * @param {Object} filterMapping - Mapping of query param names to filter configurations
 * @returns {Object} - Mongoose filter object
 */
export function buildFilter(queryParams, filterMapping) {
    const filter = {};

    for (const [param, config] of Object.entries(filterMapping)) {
        if (queryParams[param] === undefined) continue;

        const value = queryParams[param];

        switch (config.type) {
            case 'exact':
                filter[config.field] = value;
                break;

            case 'contains':
                filter[config.field] = { $regex: value, $options: 'i' };
                break;

            case 'numeric':
                // Handle numeric ranges
                if (param.endsWith('Min')) {
                    const field = config.field;
                    filter[field] = filter[field] || {};
                    filter[field].$gte = Number(value);
                } else if (param.endsWith('Max')) {
                    const field = config.field;
                    filter[field] = filter[field] || {};
                    filter[field].$lte = Number(value);
                } else {
                    filter[config.field] = Number(value);
                }
                break;

            case 'boolean':
                filter[config.field] = value === 'true';
                break;

            case 'date':
                // Handle date ranges
                if (param.endsWith('Start')) {
                    const field = config.field;
                    filter[field] = filter[field] || {};
                    filter[field].$gte = new Date(value);
                } else if (param.endsWith('End')) {
                    const field = config.field;
                    filter[field] = filter[field] || {};
                    filter[field].$lte = new Date(value);
                } else {
                    filter[config.field] = new Date(value);
                }
                break;
        }
    }

    return filter;
}