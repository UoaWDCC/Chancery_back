import * as cdk from '@aws-cdk/core';
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as iam from "@aws-cdk/aws-iam";
import * as s3 from "@aws-cdk/aws-s3"
import * as lambdaEventSources from "@aws-cdk/aws-lambda-event-sources";

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

    const apiHandler = new lambda.Function(this, "APIflashcard", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.asset("resources"),
      handler: "api_flashcard.main",
    });

    apiHandler.addToRolePolicy(new iam.PolicyStatement({
      actions: ['dynamodb:GetItem'],
      resources: [flashcardTable.tableArn],
    }));

    const restApi = new apigateway.LambdaRestApi(this,
      'rest-api',
      {
        proxy: false,
        handler: apiHandler,
      },
    );

    const apiFlashcardResource = restApi.root.addResource('flashcard');
    const idResource = apiFlashcardResource.addResource('{Id}');

    const apiLambdaIntegration = new apigateway.LambdaIntegration(apiHandler);
    idResource.addMethod('GET', apiLambdaIntegration);

    const flashcardBucket = new s3.Bucket(
      this,
      "FlashcardBucket"
    );

    const uploadProcessor = new lambda.Function(this, "UploadProcessor",
      {
        runtime: lambda.Runtime.NODEJS_12_X,
        code: lambda.Code.asset("resources"),
        handler: "upload_processor.main",
        environment: {
          TARGET_BUCKET_NAME: flashcardBucket.bucketName,
        },
      }
    );
    
    flashcardBucket.grantRead(uploadProcessor);

    const uploadEvent = new lambdaEventSources.S3EventSource(
      flashcardBucket,
      { events: [s3.EventType.OBJECT_CREATED] }
    );

    uploadProcessor.addEventSource(uploadEvent);

  }
}
