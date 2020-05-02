#!/bin/bash
aws_profile=('');

#loop AWS profiles
for i in "${aws_profile[@]}"; do
  echo "${i}"
  buckets=($(aws --profile "${i}" --region eu-west-1 s3 ls s3:// --recursive | awk '{print $3}'))

  #loop S3 buckets
  for j in "${buckets[@]}"; do
    if [[ $j ==  plf-stage-door-ui* ]]
    then
      #aws s3 rm s3://$j --recursive
      echo "aws s3 rb s3://$j --force"
      aws --profile "${i}" s3 rb s3://$j --force 
    fi
  done
done