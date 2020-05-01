const AWS = require("aws-sdk");
const { TriggerProject} = require('./triggerBuild')  ;

function getBranchNamefromRef(refvalue){
  return refvalue;

}

exports.handleApiRequest =  function(event) {
  var payload = event;
  console.debug(payload);
 
  var buildParameter = {
    branchaction : "action",
    changeset : githubContext.after,
   repository : {
        name:  githubContext.repository.name,
        owner: githubContext.repository.owner.login,
        branch : getBranchNamefromRef(githubContext.ref)
    }
  }

  TriggerProject(buildParameter)
}

exports.handleGitHubMessage =  function(event) {
    var payload = event.Records[0].Sns.Message;
    console.debug(payload);
    var githubContext = JSON.parse(payload);
    console.debug(githubContext);  
    var action = null;

    if(githubContext.created){
        action = "deploy"
    }
    else if(githubContext.deleted){
       action = "destroy"
    }

    var buildParameter = {
     branchaction : action,
     changeset : githubContext.after,
     repository : {
          name:  githubContext.repository.name,
          owner: githubContext.repository.owner.login,
          branch : getBranchNamefromRef(githubContext.ref)
      }
    }

    TriggerProject(buildParameter)
}

