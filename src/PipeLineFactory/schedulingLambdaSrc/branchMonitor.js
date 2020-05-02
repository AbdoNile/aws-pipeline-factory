const { TriggerProject} = require('./triggerBuild')  ;

function getBranchNamefromRef(refvalue){
  return refvalue;

}

exports.handleApiRequest = async function(event) {
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

exports.branchCreated = async function(event) {
    var payload = event.Records[0].Sns.Message;
    console.debug(payload);
    var buildParameter = JSON.parse(payload);
   
   TriggerProject(buildParameter)
}

exports.githubEventRecieved = function(event) {
  var payload = event.Records[0].Sns.Message;
  console.debug(payload);
  var githubContext = JSON.parse(payload);
  console.debug(githubContext);  
 
  var buildParameter = {
    "repository_name" : githubContext.repository.name,
    "repository_owner" : githubContext.repository.owner.login,
    "branch" : getBranchNamefromRef(githubContext.ref)
  };

  TriggerProject(buildParameter)
}