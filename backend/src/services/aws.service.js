import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';

/**
 * Creates and returns an AWS SDK v3 EC2Client instance using decrypted credentials.
 * @param {Object} params
 * @param {string} params.accessKeyId
 * @param {string} params.secretAccessKey
 * @param {string} [params.sessionToken]
 * @param {string} params.region
 * @returns {EC2Client}
 */
export const createEC2Client = ({ accessKeyId, secretAccessKey, sessionToken, region }) => {
  const credentials = {
    accessKeyId,
    secretAccessKey,
  };

  if (sessionToken && sessionToken.trim() !== '') {
    credentials.sessionToken = sessionToken;
  }

  return new EC2Client({
    region: region || 'ap-south-1',
    credentials,
  });
};

/**
 * Normalizes filter inputs into standard AWS SDK EC2 Filter objects.
 * Supported filters: instance-state-name, instance-type, tag:Name
 * @param {Array|Object} filters 
 * @returns {Array<{Name: string, Values: Array<string>}>}
 */
const formatFilters = (filters) => {
  if (!filters) return [];
  if (Array.isArray(filters)) {
    return filters.map(f => ({
      Name: f.name || f.Name,
      Values: Array.isArray(f.values || f.Values) ? (f.values || f.Values) : [String(f.value || f.Value || f.values || f.Values)]
    })).filter(f => f.Name && f.Values.length > 0);
  }

  if (typeof filters === 'object') {
    return Object.entries(filters).map(([key, val]) => ({
      Name: key,
      Values: Array.isArray(val) ? val.map(String) : [String(val)]
    }));
  }

  return [];
};

/**
 * Executes DescribeInstancesCommand on the provided EC2Client.
 * @param {EC2Client} client 
 * @param {Array|Object} rawFilters 
 * @returns {Promise<Object>} Formatted list of reservations and instances
 */
export const describeInstances = async (client, rawFilters = []) => {
  const formattedFilters = formatFilters(rawFilters);
  
  const commandInput = {};
  if (formattedFilters.length > 0) {
    commandInput.Filters = formattedFilters;
  }

  const command = new DescribeInstancesCommand(commandInput);
  const data = await client.send(command);

  // Clean up and structure the EC2 instance output for simple readability
  const reservations = (data.Reservations || []).map((res) => ({
    reservationId: res.ReservationId,
    ownerId: res.OwnerId,
    instances: (res.Instances || []).map((inst) => {
      const nameTag = (inst.Tags || []).find((t) => t.Key === 'Name');
      return {
        instanceId: inst.InstanceId,
        instanceType: inst.InstanceType,
        state: inst.State ? inst.State.Name : 'unknown',
        publicIpAddress: inst.PublicIpAddress || null,
        privateIpAddress: inst.PrivateIpAddress || null,
        launchTime: inst.LaunchTime,
        availabilityZone: inst.Placement ? inst.Placement.AvailabilityZone : null,
        name: nameTag ? nameTag.Value : null,
        tags: inst.Tags || []
      };
    })
  }));

  const flatInstances = reservations.flatMap(r => r.instances);

  return {
    totalReservations: reservations.length,
    totalInstances: flatInstances.length,
    instances: flatInstances,
    rawReservations: reservations
  };
};

export default {
  createEC2Client,
  describeInstances
};
