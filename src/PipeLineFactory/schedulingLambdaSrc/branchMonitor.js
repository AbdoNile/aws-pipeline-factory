const { TriggerProject } = require('./triggerBuild');

function getBranchNamefromRef(refvalue) {
  return refvalue;

}


exports.apiBranchCreated = function (event, context, callback) {
  var payload = event.body;
  console.debug(payload);
  var buildParameter = JSON.parse(payload);

  var result = TriggerProject(buildParameter, "create")
  callback(null , ({
    'statusCode': 200,
    'headers': { 'Content-Type': 'application/json' },
    'body': JSON.stringify(result)
  }));

}

exports.apiBranchDeleted = function (event, context, callback) {
    var payload = event.body;
  console.debug(payload);
  var buildParameter = JSON.parse(payload);
  var result = TriggerProject(buildParameter, "destroy")
  callback(null , ({
    'statusCode': 200,
    'headers': { 'Content-Type': 'application/json' },
    'body': JSON.stringify(result)
  }));
 
}

exports.snsBranchDeleted = function (event) {
  var payload = event.Records[0].Sns.Message;
  console.debug(payload);
  var githubContext = JSON.parse(payload);
  console.debug(githubContext);

  var buildParameter = {
    "repository_name": githubContext.repository.name,
    "repository_owner": githubContext.repository.owner.login,
    "branch": getBranchNamefromRef(githubContext.ref)
  };

  TriggerProject(buildParameter, "destroy")
}

exports.snsBracnhCreated = function (event) {
  var payload = event.Records[0].Sns.Message;
  console.debug(payload);
  var githubContext = JSON.parse(payload);
  console.debug(githubContext);

  var buildParameter = {
    "repository_name": githubContext.repository.name,
    "repository_owner": githubContext.repository.owner.login,
    "branch": getBranchNamefromRef(githubContext.ref)
  };

  TriggerProject(buildParameter, "create")
}