import { Helmet } from 'react-helmet-async';

export default function TestHelmet() {
  return (
    <Helmet>
      <title>TEST TITLE - Should Appear</title>
      <meta name="description" content="This is a test meta description that should appear in the head" />
      <meta name="test-tag" content="helmet-working" />
    </Helmet>
  );
}
