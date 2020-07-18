import { S3Event } from "aws-lambda"
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

exports.main = async (event: S3Event) => {
    // const dbClient = new DocumentClient();

    // const bucket = event.Records[0].s3.bucket.name;

    //TODO
    console.log(event.Records[0]);
    
    
}
