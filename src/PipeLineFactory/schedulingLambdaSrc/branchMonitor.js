const { TriggerProject } = require('./triggerBuild');

exports.apiBranchCreated = function (event, context, callback) {
  var payload = event.body;
  var buildParameter = JSON.parse(payload);
  console.debug(`pay load received ${JSON.stringify(buildParameter, null , 4)}`);

  var result = TriggerProject(buildParameter, "create")
  callback(null , ({
    'statusCode': 200,
    'headers': { 'Content-Type': 'application/json' },
    'body': JSON.stringify(result)
  }));

}

exports.apiBranchDeleted = function (event, context, callback) {
  var payload = event.body;
  var buildParameter = JSON.parse(payload);
  console.debug(`pay load received ${JSON.stringify(buildParameter, null , 4)}`);
 
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
    "branch": githubContext.ref
  };

  TriggerProject(buildParameter, "destroy")
}

exports.snsBranchCreated = function (event) {
  var payload = event.Records[0].Sns.Message;
  console.debug(payload);
  var githubContext = JSON.parse(payload);
  console.debug(githubContext);

  var buildParameter = {
    "repository_name": githubContext.repository.name,
    "repository_owner": githubContext.repository.owner.login,
    "branch": githubContext.ref
  };

  TriggerProject(buildParameter, "create")
}