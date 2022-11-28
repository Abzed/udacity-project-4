import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Types } from 'aws-sdk/clients/s3';
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";
import { createLogger } from '../utils/logger'

const logger = createLogger('dynamoDb');

const AWSXRay = require("aws-xray-sdk")
const XAWS = AWSXRay.captureAWS(AWS)


export class ToDoAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly s3Client: Types = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly todoTable = process.env.TODOS_TABLE,
        // private readonly s3BucketName = process.env.S3_BUCKET_NAME 
        private readonly s3BucketName = "serverless-todo-app-abzed-dev" 
        ) {}
// CREATING TODO
async createToDo(todoItem: TodoItem): Promise<TodoItem> {
    logger.info("Creating new todo");

    const params = {
        TableName: this.todoTable,
        Item: todoItem,
    };

    const result = await this.docClient.put(params).promise();
    logger.info("Updates in progress", result);

    return todoItem as TodoItem;
}
// UPDATING TODO
async updateToDo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
    logger.info("Updating todo");

    const params = {
        TableName: this.todoTable,
        Key: {
            "userId": userId,
            "todoId": todoId
        },
        UpdateExpression: "set #a = :a, #b = :b, #c = :c",
        ExpressionAttributeNames: {
            "#a": "name",
            "#b": "dueDate",
            "#c": "done"
        },
        ExpressionAttributeValues: {
            ":a": todoUpdate['name'],
            ":b": todoUpdate['dueDate'],
            ":c": todoUpdate['done']
        },
        ReturnValues: "ALL_NEW"
    };

    const result = await this.docClient.update(params).promise();
    logger.info("updating...", result);
    const attributes = result.Attributes;

    return attributes as TodoUpdate;
}
// GET TODO
    async getAllToDo(userId: string): Promise<TodoItem[]> {
        logger.info("Getting all todo");

        const params = {
            TableName: this.todoTable,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        };

        const result = await this.docClient.query(params).promise();
        logger.info("All todos",result);
        const items = result.Items;

        return items as TodoItem[];
    }

// DELETING TODO
    async deleteToDo(todoId: string, userId: string): Promise<string> {
        logger.info("Deleting todo");

        const params = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        };

        const result = await this.docClient.delete(params).promise();
        logger.info("Todo deleted", result);

        return "" as string;
    }
// GENERATING UPLOAD URL
    async generateUploadUrl(todoId: string): Promise<string> {
        logger.info("Generating URL");

        const url = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: todoId,
            Expires: 1000,
        });
        logger.info("Updating image url", url);

        return url as string;
    }
}
