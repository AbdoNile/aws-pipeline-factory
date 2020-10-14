function extractBranchName(branchName) {
  
  var trimmedBranchName = branchName.toLowerCase();

  if(branchName.startsWith("refs/heads/"))
  {
    trimmedBranchName = branchName.replace("refs/heads/", "");
  }
  
  console.debug(`branch name passed from github: [${branchName}] , Trimmed Branch Name : [${trimmedBranchName}] ` )
  return trimmedBranchName;
}


function mergeRepositorySettings(payLoad) {
  var mergedParameters = payLoad 

  const repositorySettings = payLoad.settings;
  
  mergedParameters.settings = null;

  if(repositorySettings){
    Object.keys(repositorySettings).forEach(function (key) {
      mergedParameters[key] = repositorySettings[key];
    });
  }
  return mergedParameters;
}

exports.TriggerProject = function (payLoad, requestedAction) {
  console.debug(`requested action ${requestedAction}`);
  
  const buildParameters = mergeRepositorySettings(payLoad);

  console.debug(`merged build Parameters ${JSON.stringify(buildParameters, null , 4)}`);
 
  const branchName = extractBranchName(buildParameters.branch);

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
        value: branchName,
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

  if (requestedAction == "destroy") {
    params.buildspecOverride = 'src/PipeLineTemplate/teardown.json';
  }

  const monitoredBranches = Array.isArray(buildParameters.monitoredBranches) ? buildParameters.monitoredBranches : []
  monitoredBranches.push('master');
  if(monitoredBranches.includes(branchName)) {
    console.debug(`branch name is configured for monitoring`)
  }
  else {
    console.debug(`Skipping , branch name is not configured for monitoring , configured branches are ${JSON.stringify(monitoredBranches)}`)
    return { message : `This branch is not configured for monitoring  , configured branches are ${JSON.stringify(monitoredBranches)}`      };   
  }

  //return;
  const AWS = require("aws-sdk");
  var codebuild = new AWS.CodeBuild({ apiVersion: '2016-10-06' });
  var buildResult = codebuild.startBuild(params, function (err, data) {
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