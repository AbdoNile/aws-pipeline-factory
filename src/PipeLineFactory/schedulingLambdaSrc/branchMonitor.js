exports.handleGitHubMessage = async function(event) {
    var payload = event.Records[0].Sns.Message;
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
      bracnhName : githubContext.ref,
      repository : {
          name:  githubContext.repository.name,
          owner: githubContext.repository.owner.name
      } 

    }

    console.debug(buildParameter);  
   

    var codebuild = new AWS.CodeBuild({apiVersion: '2016-10-06'});
    
  /** */
 

}