import * as lambda from 'aws-lambda';

//NOT VERY USEFUL lists repopsitories
// import { RepositoryExplorer } from '../monitor/repository-explorer';
// import { GithubClient } from '../monitor/github-client';
// import { OrganizationManager } from '../monitor/organization-manager';
// new OrganizationManager().get('stage-tech').then(data => {
//   console.log(data)
//   const ghClient = new GithubClient(data.githubToken);
//   const respExplorer = new RepositoryExplorer(ghClient);
//   respExplorer.listRepositories('stage-tech').then(data => {
//     console.log(data)
//   })
// });


//Retreives commit author
// import { Octokit } from '@octokit/rest';
// import { OrganizationManager } from '../monitor/organization-manager';
// new OrganizationManager().get('stage-tech').then(data => {
//   const octokit = new Octokit({auth: data.githubToken})
//   octokit.git.getCommit({
//     owner: 'stage-tech',
//     repo: 'stage-door-datasync-execution-lambda',
//     commit_sha: '4821350e17367a593b9ee660151c9f3631e2ce92'
//   }).then(data => console.log(data))
// });


//Retrieves phases
// import { CodeBuild } from '@aws-sdk/client-codebuild';
// const func = () => {
//   const buildClient = new CodeBuild({region: 'eu-west-1'});
//   const buildProject = buildClient.batchGetBuilds({
//     ids: ['PLF-stage-door-cdk-master:5d19f249-7c3a-4a57-a1e8-77299c7da00a',]
//   })
//   buildProject.then(data => {
//     //@ts-ignore
//     console.log(data.builds[0].phases)
//   })
// }
// func()

//Retrievs build logs link
// import { CodeBuild } from '@aws-sdk/client-codebuild';
// const func = () => {
//   const buildClient = new CodeBuild({region: 'eu-west-1'});
//   const buildProject = buildClient.batchGetBuilds({
//     ids: ['PLF-stage-door-cdk-master:5d19f249-7c3a-4a57-a1e8-77299c7da00a',]
//   })
//   buildProject.then(data => {
//     console.log(data)
//     // @ts-ignore
//     console.log(data.builds[0].logs);
//   })
// }
// func()

// Retrieves buildId's
// import { CodeBuild } from '@aws-sdk/client-codebuild';
// const func = () => {
//   const buildClient = new CodeBuild({region: 'eu-west-1'});
//   const buildProject = buildClient.listBuildsForProject({
//     projectName: 'PLF-stage-door-cdk-master'
//   })
//   buildProject.then(data => {
//     console.log(data)
//   })
// }
// func()

// Retrieved build project name
// import { CodePipeline } from '@aws-sdk/client-codepipeline';
// const func = () => {
//   const pipelineClient = new CodePipeline({region: 'eu-west-1'});
//   const execution = pipelineClient.getPipeline({
//     name: 'stage-door-datasync-execution-lambda-master'
//   })
//   execution.then(data => {
//     console.log(data)
//     data.pipeline?.stages?.forEach(stage => {
//       console.log(stage.name)
//       stage.actions?.forEach(action => {
//         console.log(action)
//       })

//     })
//   })
// }
// func()

//Retrieve which stage failed
// import { CodePipeline } from '@aws-sdk/client-codepipeline';
// const func = () => {
//   const pipelineClient = new CodePipeline({region: 'eu-west-1'});
//   const execution = pipelineClient.listActionExecutions({
//     pipelineName: 'stage-door-datasync-execution-lambda-master',
//     filter: {
//       pipelineExecutionId: '42bb849b-c35c-4548-b0b7-767921c4e6c9'
//     }
//   })
//   execution.then(data => {
//     console.log(data);
//   })
// }
// func()

//Retrieved commitUrl, action taken
// import { CodePipeline } from '@aws-sdk/client-codepipeline';
// const func = () => {
//   const pipelineClient = new CodePipeline({region: 'eu-west-1'});
//   const execution = pipelineClient.getPipelineExecution({
//     pipelineExecutionId: '42bb849b-c35c-4548-b0b7-767921c4e6c9',
//     pipelineName: 'stage-door-datasync-execution-lambda-master'
//   })
//   execution.then(data => {
//     console.log(data)
//     data.pipelineExecution?.artifactRevisions?.forEach(revision => {
//       console.log(revision.revisionUrl)
//       console.log(revision.revisionSummary)
//     });

//     console.log(data.pipelineExecution?.artifactRevisions);

//   })
// }
// func()

class PipelineNotificationsHandler {
  public handler = async (event: lambda.SNSEvent) => {
    const payload = JSON.parse(event.Records[0].Sns.Message || '');

    console.log(JSON.stringify(payload, null, 4));
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };
  };
}

export const handler = new PipelineNotificationsHandler().handler;
