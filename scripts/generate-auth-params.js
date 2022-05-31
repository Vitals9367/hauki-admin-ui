// eslint-disable-next-line @typescript-eslint/no-var-requires
const crypto = require('crypto');

// __ENV is for k6
// eslint-disable-next-line no-undef
// eslint-disable-next-line dot-notation
const env = global['__ENV'] || process.env;

const key = env.HAUKI_KEY;
const username = env.HAUKI_USER || 'admin@hel.fi';
const resource = env.HAUKI_RESOURCE || 'tprek:8215';
const organization =
  env.HAUKI_ORGANIZATION || 'tprek:dc7d39db-b35a-4612-a921-1b7b24b0baa3';
const source = env.HAUKI_SOURCE || 'tprek';
const now = new Date();
const createdAt = now.toJSON();
const validUntil =
  env.HAUKI_VALID_UNTIL || new Date(now.setDate(now.getDate() + 7)).toJSON();
const hasOrganizationRights = env.HAUKI_HAS_ORGANIZATION_RIGHTS || 'true';

const signatureStr = `${source}${username}${createdAt}${validUntil}${organization}${resource}${hasOrganizationRights}`;

const signature = crypto
  .createHmac('sha256', Buffer.from(key, 'utf-8'))
  .update(Buffer.from(signatureStr, 'utf-8'))
  .digest('hex');

const queryParameters = [
  `hsa_source=${encodeURIComponent(source)}`,
  `hsa_username=${encodeURIComponent(username)}`,
  `hsa_created_at=${encodeURIComponent(createdAt)}`,
  `hsa_valid_until=${encodeURIComponent(validUntil)}`,
  `hsa_resource=${encodeURIComponent(resource)}`,
  `hsa_organization=${encodeURIComponent(organization)}`,
  `hsa_has_organization_rights=${encodeURIComponent(hasOrganizationRights)}`,
  `hsa_signature=${signature}`,
].join('&');

process.stdout.write(queryParameters);
