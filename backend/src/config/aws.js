/**
 * AWS Configuration constants and region mappings.
 */
export const DEFAULT_AWS_REGION = 'ap-south-1';

export const REGION_MAPPINGS = {
  'mumbai': 'ap-south-1',
  'virginia': 'us-east-1',
  'oregon': 'us-west-2',
  'ohio': 'us-east-2',
  'tokyo': 'ap-northeast-1',
  'london': 'eu-west-2',
  'frankfurt': 'eu-central-1',
  'singapore': 'ap-southeast-1',
  'sydney': 'ap-southeast-2'
};

export const SUPPORTED_OPERATIONS = ['describe_instances', 'describeinstances'];
export const UNSUPPORTED_OPERATIONS = ['create_ec2', 'terminate_ec2', 'start_instance', 'stop_instance', 'run_instance', 'createinstance', 'terminateinstance'];
