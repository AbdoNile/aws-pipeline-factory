import * as events from '@aws-cdk/aws-events';
import * as logs from '@aws-cdk/aws-logs';


export class CloudWatchLogsTarget implements events.IRuleTarget {
  private logGroup: logs.ILogGroup;

  constructor(logGroup: logs.ILogGroup) {
    this.logGroup = logGroup;
  }

  public bind(_rule: events.IRule, _id?: string): events.RuleTargetConfig {
    return {
      id: '',
      // we can't use logGroup.logArn because it has `:*` on the end, and it's a token
      // so we can't just remove the suffix with string replacement operations
      // aws-cdk issue: https://github.com/aws/aws-cdk/issues/9953
      arn: `arn:aws:logs:${this.logGroup.stack.region}:${this.logGroup.stack.account}:log-group:${this.logGroup.logGroupName}`,
    };
  }
}
