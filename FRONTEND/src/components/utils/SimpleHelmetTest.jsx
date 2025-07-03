import { Helmet } from 'react-helmet-async';

export default function SimpleHelmetTest() {
  console.log('🔥 SimpleHelmetTest rendering...');
  
  return (
    <Helmet>
      <title>SIMPLE TEST TITLE</title>
      <meta name="description" content="Simple test description" />
    </Helmet>
  );
}
