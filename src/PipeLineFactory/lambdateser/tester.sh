aws sns publish \
    --topic-arn "arn:aws:sns:eu-west-1:928065939415:PipeLine-Factory-GitHubUpdates" \
    --message file://testpayload.json --profile stage-dev

    
