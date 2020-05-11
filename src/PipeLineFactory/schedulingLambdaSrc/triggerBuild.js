

exports.TriggerProject = function (buildParameter, requestedAction) {

  console.debug(buildParameter);


  var buildProjectName = process.env.FactoryCodeBuildProjectName;
  var transientArtifactsBucket = buildParameter.transient_artifacts_bucket || process.env.DEFAULT_TRANSIENT_ARTIFACTS_BUCKET_NAME;
  var artifactsBucketName = buildParameter.artifacts_bucket_name || process.env.DEFAULT_ARTIFACTS_BUCKET_NAME;
  var githHubTokenSecretName = buildParameter.github_token_secret_name || process.env.DEFAULT_GITHUB_TOKEN_SECRET_NAME;
  var buildAsRoleArn = buildParameter.build_as_role_arn || process.env.BUILD_AS_ROLE_ARN;
  var buildSpecLoction = buildParameter.buildspec_loction || "buildspec.yml";
  var artifactsPrefix = buildParameter.artifacts_prefix || "";


  var params =
  {
    projectName: buildProjectName,
    environmentVariablesOverride: [
      {
        name: 'GITHUB_REPOSITORY_NAME',
        value: buildParameter.repository_name,
        type: "PLAINTEXT"
      },
      {
        name: 'GITHUB_REPOSITORY_BRANCH',
        value: buildParameter.branch,
        type: "PLAINTEXT"
      },
      {
        name: 'GITHUB_REPOSITORY_OWNER',
        value: buildParameter.repository_owner,
        type: "PLAINTEXT"
      },
      {
        name: 'BUILD_SPEC_RELATIVE_LOCATION',
        value: buildSpecLoction,
        type: "PLAINTEXT"
      },
      {
        name: 'ARTIFACTS_BUCKET',
        value: artifactsBucketName,
        type: "PLAINTEXT"
      },
      {
        name: 'GITHUB_TOKEN_SECRETNAME',
        value: githHubTokenSecretName,
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