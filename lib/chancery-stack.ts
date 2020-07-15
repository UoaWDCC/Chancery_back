import * as cdk from '@aws-cdk/core';
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
const AWS = require('aws-sdk');

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

    const db = new AWS.DynamoDB({
      apiVersion: '2012-08-10'
    });

    const dbParams = {
      AttributeDefinitions: [
        {
          AttributeName: 'ID',
          AttributeType: 'N'
        },
      ],
      KeySchema: [
        {
          AttributeName: 'ID',
          KeyType: 'HASH'
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      },
      TableName: 'FLASH_CARDS',
    };
    
    db.createTable(dbParams, function(err: any, data: any) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
  }
}
