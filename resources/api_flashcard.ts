import { APIGatewayProxyEvent } from "aws-lambda"

exports.main = async function(event: APIGatewayProxyEvent) {
    //TODO
    return JSON.stringify(event);
}
