import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";

export default class NotificationsLambdaRole extends cdk.Construct {
  lambdaRole: iam.Role;
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);
    // role to run the lambda function
    const lambdaRole = new iam.Role(this, "Role_LambdaFunction", {
      roleName: `${cdk.Stack.of(this).stackName}-Notifications-Lambda`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    this.lambdaRole = lambdaRole;
  }
}
