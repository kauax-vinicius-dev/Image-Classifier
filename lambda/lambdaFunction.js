import {
    RekognitionClient,
    DetectLabelsCommand
} from "@aws-sdk/client-rekognition";

import {
    DynamoDBClient
} from "@aws-sdk/client-dynamodb";

import {
    DynamoDBDocumentClient,
    PutCommand
} from "@aws-sdk/lib-dynamodb";

const rekognition = new RekognitionClient({});
const dynamodbClient = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(dynamodbClient);

export const handler = async (event) => {
    const record = event.Records[0];
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(
        record.s3.object.key.replace(/\+/g, " ")
    );

    console.log("Bucket:", bucket);
    console.log("Imagem:", key);

    const command = new DetectLabelsCommand({

        Image: {
            S3Object: {
                Bucket: bucket,
                Name: key
            }
        },
        MaxLabels: 10,
        MinConfidence: 70
    });

    const response = await rekognition.send(command);

    console.log("Classificações:");

    response.Labels.forEach(label => {
        console.log(
            `${label.Name} - ${label.Confidence.toFixed(2)}%`
        );
    });

    const item = {
        imageId: `${bucket}/${key}`,
        bucket: bucket,
        image: key,
        labels: response.Labels.map(label => ({
            Name: label.Name,
            Confidence: label.Confidence
        })),
        createdAt: new Date().toISOString()
    };

    const dynamoCommand = new PutCommand({
        TableName: "ImageClassifications",
        Item: item
    });

    await dynamodb.send(dynamoCommand);

    console.log("Resultado salvo no DynamoDB");

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Imagem analisada e salva com sucesso",
            image: key,
            labels: response.Labels
        })
    };
};