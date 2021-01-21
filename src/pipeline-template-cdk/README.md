# Pipeline Template CDK

This CDK repo holds the template for the code pipelines deployed by the pipeline factory.

The following ENV variables are used to configure the pipeline:

|Variable Name|Description|Alternate Source|
|---|---|--|
|GITHUB_REPOSITORY_NAME|The name of the pipelines source repo|Mandatory|
|GITHUB_REPOSITORY_OWNER|The name of the repository owner|Mandatory|
|GITHUB_REPOSITORY_BRANCH|The name of the branch the pipeline is bound to|Mandatory|
|BUILD_AS_ROLE_ARN|The role ARN to execute the build under|From SSM: `/pipeline-factory/default-build-as-role`|
|BUILD_SPEC_RELATIVE_LOCATION|The name/path of the build spec executed by code build (relative to the root of the repo)|`buildspec.yml`|
|GITHUB_TOKEN_SECRET_ARN|The ARN of the token secret|From SSM: `/pipeline-factory/default-github-token`|
|ARTIFACTS_BUCKET|The name of the code build artifact bucket|From SSM: `/pipeline-factory/artifactsBucket`|

The `cdk.json` file tells the CDK Toolkit how to execute the [code-pipeline-app](./bin/code-pipeline-app.ts)

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## Local Deployments

To deploy a pipeline from your local environment create a `.env` file like the following:

```shell
GITHUB_REPOSITORY_NAME=test-repo-cdk
GITHUB_REPOSITORY_OWNER=stage-tech
GITHUB_REPOSITORY_BRANCH=master
```

Add other ENV variables as required.

Then execute the following:

```shell
cdk deploy --profile salt-dev
```
