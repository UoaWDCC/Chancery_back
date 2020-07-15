import * as cdk from '@aws-cdk/core';
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as iam from "@aws-cdk/aws-iam";

export class ChanceryStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const flashcardTable = new dynamodb.Table(this, 'flashcard-table',
      {
          tableName: 'flashcard-table',
          partitionKey: {
              name: 'Id',
              type: dynamodb.AttributeType.STRING,
          },
          billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      });

      const handler = new lambda.Function(this, "APIflashcard", {
        runtime: lambda.Runtime.NODEJS_10_X,
        code: lambda.Code.asset("resources"),
        handler: "api_flashcard.main",
      });

      handler.addToRolePolicy(new iam.PolicyStatement({
        actions: ['dynamodb:GetItem'],
        resources: [flashcardTable.tableArn],
      }));

      const restApi = new apigateway.LambdaRestApi(this,
        'rest-api',
        {
          proxy: false,
          handler,
        },
      );
      
      const apiFlashcardResource = restApi.root.addResource('flashcard');
      const idResource = apiFlashcardResource.addResource('{Id}');
      
      const apiLambdaIntegration = new apigateway.LambdaIntegration(handler);
      idResource.addMethod('GET', apiLambdaIntegration);
      
  }
}
