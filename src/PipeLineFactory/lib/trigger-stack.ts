import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
import FactoryProperties from "./factoryProperties";
import Factory from "./factory";
import Notifications from "./notifications/notifications";
import Api from "./api";
import DefaultBuildAsRole from "./default-build-as-role";

export class TriggerStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: FactoryProperties) {
    super(scope, id, props);

    cdk.Tags.of(this).add("service", "pipeline-factory");

    const transientArtifactsBucket = new s3.Bucket(this, "transientBucket", {
      bucketName: `${this.stackName.toLowerCase()}-${this.account}-${this.region}-artifacts`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

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

    const factory = new Factory(this, "factoryBuilder", props);

    new Api(this, "Api", {
      PipelineFactoryBuildProjectArn: factory.buildProjectArn,
      buildAsRoleArn: defaultBuildAsRole.role.roleArn,
      apiDomainCertificateArn: props.apiDomainCertificateArn,
      apiDomainName: props.apiDomainName,
      transientArtifactsBucketName: transientArtifactsBucket.bucketName,
      triggerCodeS3Bucket: props.triggerCodeS3Bucket,
      triggerCodeS3Key: props.triggerCodeS3Key,
      defaultArtifactsBucketName: props.defaultArtifactsBucket,
      defaultGithubTokenSecretName: defaultGitHubSecret.secretName,
    });

    new Notifications(this, "PipelineNotifications", {
      triggerCodeS3Bucket: props.triggerCodeS3Bucket,
      triggerCodeS3Key: props.triggerCodeS3Key,
    });
  }
}
