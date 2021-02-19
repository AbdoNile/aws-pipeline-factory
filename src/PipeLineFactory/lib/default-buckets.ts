import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as ssm from "@aws-cdk/aws-ssm";
import * as kms from "@aws-cdk/aws-kms";
import * as iam from "@aws-cdk/aws-iam";

export interface DefaultBucketsProps {
  existingBucketName?: string;
  buildRole : iam.Role;
}

export default class DefaultBuckets extends cdk.Construct {
  transientArtifactsBucket: s3.Bucket;
  artifactsBucket: s3.IBucket;
  constructor(scope: cdk.Construct, id: string, props: DefaultBucketsProps) {
    super(scope, id);

    const stack = cdk.Stack.of(this);

    const bucketEncryptionKey = new kms.Key(this, "BucketEncryption", {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    bucketEncryptionKey.grantEncryptDecrypt(
      new iam.ArnPrincipal(props.buildRole.roleArn)
    );
    
    this.transientArtifactsBucket = new s3.Bucket(this, "transientBucket", {
      bucketName: `${stack.stackName.toLowerCase()}-${stack.account}-${
        stack.region
      }-transient`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryptionKey: bucketEncryptionKey,
      encryption: s3.BucketEncryption.KMS,
    });

    new ssm.StringParameter(this, "transientArtifactsBucketSsm", {
      parameterName: `/${stack.stackName.toLowerCase()}/transientArtifactsBucket`,
      stringValue: this.transientArtifactsBucket.bucketName,
    });

    if (props.existingBucketName) {
      this.artifactsBucket = s3.Bucket.fromBucketName(
        this,
        "existingArtifactsBucket",
        props.existingBucketName
      );
    } else {
      this.artifactsBucket = new s3.Bucket(this, "artifactsBucket", {
        bucketName: `${stack.stackName.toLowerCase()}-${stack.account}-${
          stack.region
        }-artifacts`,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        encryptionKey: bucketEncryptionKey,
        encryption: s3.BucketEncryption.KMS,
      });
    }
    new ssm.StringParameter(this, "artifactsBucketSsm", {
      parameterName: `/${stack.stackName.toLowerCase()}/artifactsBucket`,
      stringValue: this.artifactsBucket.bucketName,
    });
  }
}
