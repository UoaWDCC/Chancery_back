# Chancery Backend
This project is the backend of the Chancery web application. Chancery aims to become a platform where students can prepare for investment banking interviews. The web application provides a bank of flashcards where students can practice answering common questions that appear in the interviews. 
The backend utilises [Amazon Web Services (AWS)](https://aws.amazon.com/) to create a cloud-based API to serve the front-end.

## Team Members
* Yuno Oh [yuno99825](https://github.com/yuno99825)
* Charlie Yang [Chuppay](https://github.com/Chuppay)

## Getting Started
These instructions will allow you to deploy a stack from your local machine for development and testing purposes.

### Please install the following
* [npm](https://www.npmjs.com/)
* [node.js](https://nodejs.org/en/)
* [AWS CLI](https://aws.amazon.com/cli/)

### Useful commands
 * `npm install`     install dependencies
 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests (tests still needed to be written)
 * `cdk deploy`      deploy this stack to your default AWS account/region - this command should be followed by the name of the stack e.g. `cdk deploy ChanceryStack`
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
 
## Architecture
The stack is built using AWS and specified using the [AWS CDK](https://aws.amazon.com/cdk/)
### AWS services used
 * Lambda
 * S3
 * DynamoDB
 * API Gateway
 * Cognito (not yet implemented)
### API endpoints
Once a stack is deployed, several endpoints will be created:
 
 * `GET /flashcard/scan`              returns all flashcards
 * `GET /flashcard/scan/{topic}`      returns all flashcards of specified topic
 * `GET /flashcard/scan/topics-list`  returns list of topics
 * `GET /flashcard/{id}`              returns a single flashcard of specified ID
 
The flashcard objects will have the following fields:
 * `id` type `Number`
 * `question` type `String`
 * `answer` type `String`
 * `topic` type `String` possible values specifed by `GET /flashcard/scan/topics-list` endpoint
 * `difficulty` type `String` possible values: `Easy`, `Medium`, `Hard`
 
### Updating the question bank
A s3 bucket can be accessed using the AWS management console. Uploading a json file to this bucket with a list of flashcard objects will add them to the database.
A known issue is the timeout of the function which updates the database, which limits the size of the file.

