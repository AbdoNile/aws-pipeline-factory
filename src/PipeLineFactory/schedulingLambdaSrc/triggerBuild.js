

exports.TriggerProject = function(buildParameter){

    console.debug(buildParameter);  
    
    
    var buildProjectName = process.env.FactoryCodeBuildProjectName;
    var transientArtifactsBucket = buildParameter.transientArtifactsBucket || process.env.DEFAULT_TRANSIENT_ARTIFACTS_BUCKET_NAME;
    var artifactsBucketName = buildParameter.artifactsBucketName || process.env.DEFAULT_ARTIFACTS_BUCKET_NAME;
    var githHubTokenSecretName = buildParameter.githubTokenSecretName || process.env.DEFAULT_GITHUB_TOKEN_SECRET_NAME;
    var buildAsRoleArn = buildParameter.buildAsRoleArn || process.env.BUILD_AS_ROLE_ARN;
    var buildSpecLoction = buildParameter.buildSpecLoction || "buildspec.yml";
    var artifactsPrefix = buildParameter.artifactsPrefix || "";
    
    
    var params =
    {
      projectName: buildProjectName,
      environmentVariablesOverride: [
        {
          name: 'GITHUB_REPOSITORY_NAME', 
          value: buildParameter.repository.name, 
          type: "PLAINTEXT" 
        },
        {
          name: 'GITHUB_REPOSITORY_BRANCH', 
          value: buildParameter.repository.branch, 
          type: "PLAINTEXT" 
        },
        {
          name: 'GITHUB_REPOSITORY_OWNER', 
          value: buildParameter.repository.owner, 
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
    
    console.debug(params);  
    return;
    
    var codebuild = new AWS.CodeBuild({apiVersion: '2016-10-06'});
    codebuild.startBuild(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
  
}