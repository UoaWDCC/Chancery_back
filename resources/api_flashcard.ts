import { APIGatewayProxyEvent } from "aws-lambda"
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

exports.main = async (event: APIGatewayProxyEvent) => {
    const dbClient = new DocumentClient();

    if (event.httpMethod === "GET" && event.pathParameters && event.pathParameters.id) {
        const params = {
            TableName: 'flashcard-table',
            Key: {
                id: event.pathParameters.id
            }
        };

        try {
            const result = await dbClient.get(params).promise();
            if (result.Item) {
                return {
                    body: JSON.stringify(result.Item),
                    statusCode: 200,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET"
                    }
                }
            } else throw new Error();
        } catch {
            return {
                body: JSON.stringify({
                    message: `Failed to get flashcard with id: ${event.pathParameters!.Id}`
                }),
                statusCode: 500
            }
        }
    } else {
        return {
            body: JSON.stringify({
                message: "invalid request"
            }),
            statusCode: 500
        }
    }
}
