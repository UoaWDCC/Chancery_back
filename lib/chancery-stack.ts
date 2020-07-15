import * as cdk from '@aws-cdk/core';
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export class ChanceryStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new lambda.Function(this, "APIflashcard", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.asset("resources"),
      handler: "api_flashcard.main",
    });

    const api = new apigateway.RestApi(this, "rest-api", {
      restApiName: "chancery-api",
      description: "retrieves questions from the database"
    });

    const lambdaIntegration = new apigateway.LambdaIntegration(handler, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    api.root.addMethod("GET", lambdaIntegration)

    const flashcardTable = new dynamodb.Table(this, 'flashcard-table',
      {
          tableName: 'flashcard-table',
          partitionKey: {
              name: 'ID',
              type: dynamodb.AttributeType.STRING,
          },
          billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      });
  }
}
