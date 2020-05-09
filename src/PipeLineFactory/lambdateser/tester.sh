file=$1

echo running $file
aws sns publish \
    --topic-arn "arn:aws:sns:us-east-1:101584550521:AXTY-PipeLine-Factory-$file" \
    --message file://$file.json --profile axetay

    
