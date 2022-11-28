import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler} from 'aws-lambda';
import {getAllToDo} from "../../businessLogic/ToDo";
import { createLogger } from '../../utils/logger';

const logger = createLogger('userTodoList');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user
    logger.info("Processing Event ", event);
    const authorization = event.headers.Authorization;
    const split_authorization = authorization.split(' ');
    const jwtToken = split_authorization[1];

    const todos = await getAllToDo(jwtToken);

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            "items": todos,
        }),
    }
};
