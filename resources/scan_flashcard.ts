import { APIGatewayProxyEvent } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

exports.main = async (event: APIGatewayProxyEvent) => {
    const dbClient = new DocumentClient();

    if (event.httpMethod === "GET" && event.pathParameters && event.pathParameters.topic) {
        const params = {
            TableName: "flashcard-table",
            FilterExpression : 'topic = :filter_topic',
            ExpressionAttributeValues : {':filter_topic' : event.pathParameters.topic}
        };

        try {
            var result = await dbClient.scan(params).promise()
            return {
                body: JSON.stringify(result.Items),
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET"
                }
            }
        } catch {
            return {
                body: JSON.stringify({
                    message: `Failed to get flashcards`,
                }),
                statusCode: 500,
            };
        }
    } else if (event.httpMethod === "GET") {
        const params = {
            TableName: "flashcard-table",
        };

        try {
            var result = await dbClient.scan(params).promise()

            if (event.path === "/flashcard/scan/topics-list") {
                const topicsList: string | any[] = [];
                for (const item of result.Items!) {
                    if (!topicsList.includes(item.topic)) {
                        topicsList.push(item.topic);
                    }
                }
                return {
                    body: JSON.stringify(topicsList),
                    statusCode: 200,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET"
                    }
                }
            }

            return {
                body: JSON.stringify(result.Items),
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET"
                }
            }
        } catch {
            return {
                body: JSON.stringify({
                    message: `Failed to get flashcards`,
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
