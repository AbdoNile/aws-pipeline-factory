const AWS = require("aws-sdk");
  

function getBranchNamefromRef(refvalue){
  return refvalue.split('/').pop();

}


exports.handleGitHubMessage =  function(event) {
    var payload = event.Records[0].Sns.Message;
    console.debug(payload);
    var githubContext = JSON.parse(payload);
    console.debug(githubContext);  
    var action = null;

    if(true || githubContext.created){
        action = "deploy"
    }
    else if(githubContext.deleted){
       action = "destroy"
    }

    var buildParameter = {
      branchaction : "action",
      changeset : githubContext.after,
     repository : {
          name:  githubContext.repository.name,
          owner: githubContext.repository.owner.name,
          branch : getBranchNamefromRef(githubContext.ref)
      }
    }

    console.debug(buildParameter);  
    var codebuild = new AWS.CodeBuild({apiVersion: '2016-10-06'});
    
    var buildProjectName = process.env.FactoryCodeBuildProjectName;
    console.debug(buildProjectName);  
   
    var params =
    {
      projectName: buildProjectName,
      environmentVariablesOverride: [
        {
          name: 'githubRepositoryName', 
          value: buildParameter.repository.name, 
          type: "PLAINTEXT" 
        },
        {
          name: 'githubRepositoryBranch', 
          value: buildParameter.repository.branch, 
          type: "PLAINTEXT" 
        },
        {
          name: 'githubRepositoryOwner', 
          value: buildParameter.repository.owner, 
          type: "PLAINTEXT" 
        }
      ]
    };
    console.debug(params);  
   
    codebuild.startBuild(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });

}