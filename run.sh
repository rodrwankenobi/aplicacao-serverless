aws iam create-role \
    --role-name lambda-exemplo \
    --assume-role-policy-document file://policies.json \
    | tee logs/role.log
zip function.zip index.js

aws lambda create-function \
    --function-name hello-cli \
    --zip-file fileb://function.zip \
    --handler index.handler \
    --runtime nodejs12.x \
    --role arn:aws:iam::515655569536:role/lambda-exemplo \
    | tee logs/lambda-create.log

aws lambda invoke \
    --function-name hello-cli \
    --log-type Tail \
    logs/lambda-exec.log

aws lambda delete-function --function-name hello-cli

aws iam delete-role --role-name lambda-exemplo