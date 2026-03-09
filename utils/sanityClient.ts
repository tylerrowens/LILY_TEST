import { createClient, SanityClient } from '@sanity/client';

const client: SanityClient = createClient({
  projectId: 'ns5c94gl',
  dataset: 'production',
  useCdn: true,
});

export default client;