import * as cdk from "@aws-cdk/core";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
import FactoryProperties from "./factoryProperties";
import Factory from "./factory";
import Notifications from "./notifications/notifications";
import Api from "./api";
import DefaultBuildAsRole from "./default-build-as-role";
import DefaultBuckets from "./default-buckets";

export class TriggerStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: FactoryProperties) {
    super(scope, id, props);

    cdk.Tags.of(this).add("service", "pipeline-factory");

   
    const defaultGitHubSecret = new secretsmanager.Secret(
      this,
      "defaultGitHubSecret",
      {
        secretName: `/${this.stackName}/default-github-token`,
      }
    );

    const defaultBuildAsRole = new DefaultBuildAsRole(
      this,
      "DefaultBuildAdAsRole"
    );

    const defaultBuckets = new DefaultBuckets(this , 'defaultBuckets');

    const factory = new Factory(this, "factoryBuilder", props);

    new Api(this, "Api", {
      PipelineFactoryBuildProjectName: factory.buildProjectName,
      buildAsRoleArn: defaultBuildAsRole.role.roleArn,
      apiDomainCertificateArn: props.apiDomainCertificateArn,
      apiDomainName: props.apiDomainName,
      triggerCodeS3Bucket: props.triggerCodeS3Bucket,
      triggerCodeS3Key: props.triggerCodeS3Key,
      defaultArtifactsBucketName: defaultBuckets.artifactsBucket.bucketName,
      defaultGithubTokenSecretName: defaultGitHubSecret.secretName,
    });

    new Notifications(this, "PipelineNotifications", {
      triggerCodeS3Bucket: props.triggerCodeS3Bucket,
      triggerCodeS3Key: props.triggerCodeS3Key,
    });
  }
}
