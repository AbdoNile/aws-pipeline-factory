
function mergeRepositorySettings(payLoad) {
  var mergedParameters = payLoad 
  mergedParameters.settings = null;

  const repositorySettings = payLoad.settings;
  Object.keys(repositorySettings).forEach(function (key) {
    mergedParameters[key] = repositorySettings[key];
  });

  return mergedParameters;
}

exports.TriggerProject = function (payLoad, requestedAction) {

  console.debug(payLoad);

  const buildParameters = mergeRepositorySettings(payLoad);

  console.debug(buildParameters);

  var buildProjectName = process.env.FactoryCodeBuildProjectName;

  var transientArtifactsBucket = buildParameters.transient_artifacts_bucket || process.env.DEFAULT_TRANSIENT_ARTIFACTS_BUCKET_NAME;
  
  var artifactsBucketName = buildParameters.artifactsBucketName || process.env.DEFAULT_ARTIFACTS_BUCKET_NAME;
 
  var gitHubTokenSecretName = buildParameters.github_token_secret_name || process.env.DEFAULT_GITHUB_TOKEN_SECRET_NAME;
  
  var buildAsRoleArn = buildParameters.buildAsRoleArn || process.env.BUILD_AS_ROLE_ARN;
  
  var buildSpecLocation = buildParameters.buildspecFileLocation || "buildspec.yml";
  
  var artifactsPrefix = buildParameters.artifacts_prefix || "";
  
  var slackWorkspaceId = buildParameters.slackWorkspaceId || process.env.SLACK_WORKSPACE_ID;
  
  var slackChannelNamePrefix = buildParameters.slackChannelNamePrefix || process.env.SLACK_CHANNEL_NAME_PREFIX;


  var params =
  {
    projectName: buildProjectName,
    environmentVariablesOverride: [
      {
        name: 'GITHUB_REPOSITORY_NAME',
        value: buildParameters.repository_name,
        type: "PLAINTEXT"
      },
      {
        name: 'GITHUB_REPOSITORY_BRANCH',
        value: buildParameters.branch,
        type: "PLAINTEXT"
      },
      {
        name: 'GITHUB_REPOSITORY_OWNER',
        value: buildParameters.repository_owner,
        type: "PLAINTEXT"
      },
      {
        name: 'BUILD_SPEC_RELATIVE_LOCATION',
        value: buildSpecLocation,
        type: "PLAINTEXT"
      },
      {
        name: 'ARTIFACTS_BUCKET',
        value: artifactsBucketName,
        type: "PLAINTEXT"
      },
      {
        name: 'GITHUB_TOKEN_SECRETNAME',
        value: gitHubTokenSecretName,
        type: "PLAINTEXT"
      },
      {
        name: 'ARTIFACTS_PREFIX',
        value: artifactsPrefix,
        type: "PLAINTEXT"
      },
      {
        name: 'TRANSIENT_ARTIFACTS_BUCKET_NAME',
        value: transientArtifactsBucket,
        type: "PLAINTEXT"
      },
      {
        name: 'BUILD_AS_ROLE_ARN',
        value: buildAsRoleArn,
        type: "PLAINTEXT"
      },
      {
        name: 'SLACK_WORKSPACE_ID',
        value: slackWorkspaceId,
        type: "PLAINTEXT"
      },
      {
        name: 'SLACK_CHANNEL_NAME_PREFIX',
        value: slackChannelNamePrefix,
        type: "PLAINTEXT"
      }
    ]
  };

  console.debug(`requested action ${requestedAction}`);
  if (requestedAction == "destroy") {
    params.buildspecOverride = 'src/PipeLineTemplate/teardown.json';
  }

  console.debug(params);
  //return;
  const AWS = require("aws-sdk");
  var codebuild = new AWS.CodeBuild({ apiVersion: '2016-10-06' });
  var buildresult = codebuild.startBuild(params, function (err, data) {
    if (err) {
      console.log(err, err.stack);
      
    }// an error occurred
    else {
      console.log(data);
      return data;
    }
    // successful response
  });
  
  return params;

}