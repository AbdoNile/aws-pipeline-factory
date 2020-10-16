
#!/bin/bash
PROFILE=$1 # aws profile
PROJECT_NAME = "stage-door-task-tracker-lambda"
# If optional argument 'PROFILE' is provided - export it
if [[ ! -z $PROFILE ]]; then
    export AWS_PROFILE=$PROFILE
    echo using profile $AWS_PROFILE
fi

die()
{
  echo "Failed in script \"$0\" at line $BASH_LINENO"
  exit 1
}

hash=$(git rev-parse --short HEAD)
./build.sh $hash 
echo "enter function name you want to update"
read function_name
code_file="./packages/${PROJECT_NAME}-${hash}.zip"
echo "Updating function $function_name with code from ${code_file}"

aws lambda update-function-code --function-name $function_name --zip-file=fileb://$code_file

echo "updated code deployed successfully to function $function_name"