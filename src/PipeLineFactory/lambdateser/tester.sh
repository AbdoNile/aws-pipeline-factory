file=$1

echo running $file
aws sns publish \
    --topic-arn "arn:aws:sns:eu-west-1:928065939415:PipeLine-Factory-$file" \
    --message file://$file.json --profile stage-dev

    
