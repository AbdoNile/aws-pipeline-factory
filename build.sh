#!/bin/bash
PROFILE=$1 # aws profile

# If optional argument 'PROFILE' is provided - export it
if [[ ! -z $PROFILE ]]; then
    export AWS_PROFILE=$PROFILE
    echo using profile $AWS_PROFILE
fi

trap die ERR
die()
{
  echo "Failed in script \"$0\" at line $BASH_LINENO"
  exit 1
}

## create s3 bucket
aws_account_id=$(aws sts get-caller-identity --query 'Account' --output text)
aws_region="eu-west-1"
echo "aws account id $aws_account_id"
s3_bucket_name="salt-deployment-packages-${aws_account_id}"
if aws s3 ls "s3://$s3_bucket_name" 2>&1 | grep -q 'NoSuchBucket'
then
  aws s3api create-bucket --bucket $s3_bucket_name --create-bucket-configuration LocationConstraint=$aws_region
  echo "created artifacts bucket $s3_bucket_name"
fi

## get versioning variables
hash=$(git rev-parse --short HEAD)
branch_name=$(git rev-parse --abbrev-ref HEAD)
package_name=$(basename `git rev-parse --show-toplevel`)

echo "building for version number is $hash"
package_file_name="${package_name}-${hash}.zip"
s3_lambda_object_key="$package_name/$branch_name/$package_file_name"
s3_package_path="s3://$s3_bucket_name/$s3_lambda_object_key"

pushd $PWD
cd ./src/lambda
./build.sh $package_file_name $s3_package_path
popd

pushd $PWD
cd ./src/PipeLineFactory
cdk deploy --context s3_bucket_name=$s3_bucket_name --context s3_lambda_object_key=$s3_lambda_object_key
popd
