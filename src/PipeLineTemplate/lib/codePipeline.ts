import * as cdk from "@aws-cdk/core";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as codePipeline from "@aws-cdk/aws-codepipeline";
import * as codePipelineActions from "@aws-cdk/aws-codepipeline-actions";
import * as s3 from "@aws-cdk/aws-s3";
import * as iam from "@aws-cdk/aws-iam";
import {BuildOperationsDetails} from "./buildOperationsDetails"

export class CodePipeline extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: BuildOperationsDetails,
            buildProjectArn: string, buildAsRole : iam.IRole  ) {
    super(scope, id);

    
    var pipeline = new codePipeline.Pipeline(this, "PipeLine" ,  {
      pipelineName : `${props.projectName}`,
      role : buildAsRole
    });


    var githubToken = cdk.SecretValue.secretsManager(props.gitHubTokenSecretName)
    const sourceCodeOutput = new codePipeline.Artifact("SourceCode",)
    const fetchSourceAction = new codePipelineActions.GitHubSourceAction( {
     actionName : `GitHub-${props.projectName}`,
     repo : props.githubRepositoryName,
     owner : props.githubRepositoryOwner,
     branch : props.githubRepositoryBranch,
     output  : sourceCodeOutput,
     oauthToken : githubToken,
     trigger : codePipelineActions.GitHubTrigger.WEBHOOK

    })

    pipeline.addStage({
      stageName : "Fetch" ,
      actions : [  fetchSourceAction ]
    })

    var buildProject = codebuild.Project.fromProjectArn(this, "BuildProject", buildProjectArn)
    const buildOutput = new codePipeline.Artifact("BuildOutput")
  
    var buildAction = new codePipelineActions.CodeBuildAction({
     actionName : "RunBuildSpec" ,
     input : sourceCodeOutput,
     project : buildProject,
     outputs : [buildOutput],
    });

    pipeline.addStage({
      stageName : "Build" ,
      actions : [  buildAction ]
    });
     
    const artifactsBucket = s3.Bucket.fromBucketName(this, 'PipeLineDeploymentArtifactsBucket', props.artifactsBucket);

    let objectPrefix = `${props.githubRepositoryName}/${props.githubRepositoryBranch}`
    
    if(props.artifactsPrefix){
      objectPrefix = `${props.artifactsPrefix}/${objectPrefix}`
    }

    const publishAction = new codePipelineActions.S3DeployAction({
      actionName: 'S3Deploy',
       bucket: artifactsBucket,
      input: buildOutput,
      objectKey: objectPrefix
     
    });

      pipeline.addStage({
      stageName: 'Deploy',
      actions: [publishAction],
    });

  }
}
