# pipeline-factory-lambda

This is code for the lambda function which triggers the creation and destruction of pipelines. This lambda handler sets behind API Gateway Endpoints. The API GW is invoked by the github actions in the monitored repositories.

When a branch creation request is received , the ./src/create-branch-handler.ts is invoked.
When a branch deletion request is received , the ./src/delete-branch-handler.ts is invoked.

## Getting started

Run the following commands to configure your local environment to run the correct version of Node and install package dependencies:

```shell
nvm use
yarn
```

## Useful scripts

| Command          | What does it do?                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| yarn             | Installs package dependencies                                                                             |
| yarn build       | Transpiles TypeScript to JavaScript                                                                       |
| yarn test        | Executes all tests                                                                                        |
| yarn start       | Builds and starts the Node process                                                                        |
| yarn lint        | Builds and lints the code base                                                                            |
| yarn lambda:pack | Builds and lints the code base then creates a versioned lambda deployment package (ZIP) under ./packages/ |
