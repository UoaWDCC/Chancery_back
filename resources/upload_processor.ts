import { S3Event } from "aws-lambda"
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dbClient = new DocumentClient();

exports.main = async (event: S3Event) => {
    // const dbClient = new DocumentClient();

    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

    const typeMatch = key.match(/\.([^.]*)$/);
    if (!typeMatch) {
        console.log("Could not determine the file type.");
        return;
    }

    // Check that the file type is supported  
    const fileType = typeMatch[1].toLowerCase();
    if (fileType != "json") {
        console.log(`Unsupported file type: ${fileType}`);
        return;
    }

    const params = {
        Bucket: bucket,
        Key: key
    }
    const data = await s3.getObject(params).promise();
    const dataString = data.Body!.toString('utf-8');

    const flashcards = JSON.parse(dataString);
    for (const flashcard of flashcards) {
        await dbClient.put({
            Item: {
                id: flashcard.id.toString(),
                question: flashcard.question,
                answer: flashcard.answer,
                topic: flashcard.topic,
                difficulty: flashcard.difficulty,
            },
            TableName: process.env.TABLE_NAME!
        }).promise();
    }
}
