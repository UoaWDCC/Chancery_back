import { APIGatewayProxyEvent } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

exports.main = async (event: APIGatewayProxyEvent) => {
    const dbClient = new DocumentClient();

    if (event.httpMethod === "GET") {
        const params = {
            TableName: "flashcard-table",
        };

        try {
            var result = await dbClient.scan(params).promise()
            return {
                body: JSON.stringify(result.Items),
                statusCode: 200
            }
        } catch {
            return {
                body: JSON.stringify({
                    message: `Failed to get flashcard`,
                }),
                statusCode: 500,
            };
        }
    } else {
        return {
            body: JSON.stringify({
                message: "invalid request",
            }),
            statusCode: 500,
        };
    }
};
