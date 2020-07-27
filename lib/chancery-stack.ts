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
          name: 'id',
          type: dynamodb.AttributeType.STRING,
        },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      });

    // create api
    const restApi = new apigateway.RestApi(this,
      'flashcard-api',
    );

    // single flashcard lambda
    const singleFlashcardLambda = new lambda.Function(this, "APIflashcard", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.asset("resources"),
      handler: "api_flashcard.main",
    });

    flashcardTable.grantReadData(singleFlashcardLambda);

    // single flashcard lambda integration
    const apiFlashcardResource = restApi.root.addResource('flashcard');
    const idResource = apiFlashcardResource.addResource('{id}');

    const apiLambdaIntegration = new apigateway.LambdaIntegration(singleFlashcardLambda);
    idResource.addMethod('GET', apiLambdaIntegration);

    // all flashcard lambda 
    const scanFlashcardLambda = new lambda.Function(this, 'ScanFlashcard', {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset('resources'),
      handler: 'scan_flashcard.main'
    });

    // all flashcard lambda integration
    const apiScanFlashcardInteg = new apigateway.LambdaIntegration(scanFlashcardLambda);
    const apiScanFlashcard = apiFlashcardResource.addResource('scan');
    apiScanFlashcard.addMethod('GET', apiScanFlashcardInteg);

    const topicFilterResource = apiScanFlashcard.addResource('{topic}');
    topicFilterResource.addMethod('GET', apiScanFlashcardInteg);

    const topicsListResource = apiScanFlashcard.addResource('topics-list');
    topicsListResource.addMethod('GET', apiScanFlashcardInteg);

    flashcardTable.grantReadData(scanFlashcardLambda);

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
          TABLE_NAME: flashcardTable.tableName,
        },
      }
    );

    flashcardBucket.grantRead(uploadProcessor);
    flashcardTable.grantReadWriteData(uploadProcessor);

    const uploadEvent = new lambdaEventSources.S3EventSource(
      flashcardBucket,
      { events: [s3.EventType.OBJECT_CREATED] }
    );

    uploadProcessor.addEventSource(uploadEvent);
  }
}
