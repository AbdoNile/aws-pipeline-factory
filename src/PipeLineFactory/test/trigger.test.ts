import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import Trigger = require('../lib/trigger-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Trigger.TriggerStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
