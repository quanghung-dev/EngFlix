// Import các thư viện cần thiết
const { AzureKeyCredential } = require("@azure/core-auth");
const createClient = require("@azure-rest/ai-vision-image-analysis").default;
const { isUnexpected } = require("@azure-rest/ai-vision-image-analysis");

const fs = require("fs");
const path = require("path");

// Load the .env file if it exists
require("dotenv").config();

const endpoint = process.env['AZURE_VISION_ENDPOINT'];
const key = process.env['AZURE_VISION_KEY'];

const credential = new AzureKeyCredential(key);
const client = createClient(endpoint, credential);
const imagePath = path.join(__dirname, "image.png");
const features = [
    'Caption',
    'DenseCaptions',
    'Objects',
    'People',
    'Read',
    'SmartCrops',
    'Tags'
];

// Bọc code chạy vào hàm async để sử dụng được await
async function main() {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const result = await client.path('/imageanalysis:analyze').post({
            body: imageBuffer,
            queryParameters: {
                features: features,
                'language': 'en',
                'gender-neutral-captions': 'true',
                'smartCrops-aspect-ratios': [0.9, 1.33]
            },
            contentType: 'application/octet-stream'
        });

        // Kiểm tra lỗi từ Azure REST client
        if (isUnexpected(result)) {
            const error = result.body.error;
            console.error(`Error: ${error.code} - ${error.message}`);
            return;
        }

        const iaResult = result.body;

        const objects = iaResult.objectsResult?.values || [];

        const formattedObjects = objects.map((obj) => {
            const tag = obj.tags?.[0];

            return {
                name: tag?.name,
                confidence: tag?.confidence,
                x: obj.boundingBox.x,
                y: obj.boundingBox.y,
                width: obj.boundingBox.w,
                height: obj.boundingBox.h,
            };
        });

        console.log(JSON.stringify(formattedObjects, null, 2));
    } catch (err) {
        console.error("An unexpected error occurred:", err);
    }
}

main();
