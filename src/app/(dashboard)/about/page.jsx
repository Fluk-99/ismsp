import Head from 'next/head';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About ISO/IEC 27001</title>
        <meta
          name="description"
          content="Learn about ISO/IEC 27001, the international standard for information security management systems (ISMS)."
        />
      </Head>
      <main style={{ fontFamily: "'Arial', sans-serif", lineHeight: '1.8', margin: '20px auto', maxWidth: '900px' }}>
        {/* Hero Section */}
        <header
          style={{
            textAlign: 'center',
            marginBottom: '30px',
            padding: '30px 20px',
            background: 'linear-gradient(120deg, #003366, #0066cc)',
            color: '#fff',
          }}
        >
          <h1 style={{ fontSize: '3rem', margin: '0' }}>About ISO/IEC 27001</h1>
          <p style={{ fontSize: '1.2rem', marginTop: '10px' }}>
            Ensuring Information Security for a Better Tomorrow
          </p>
        </header>

        {/* About ISO Section */}
        <section style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '2rem', color: '#003366' }}>What is ISO/IEC 27001?</h2>
          <p>
            <strong>ISO/IEC 27001</strong> is the international standard that provides a framework for establishing,
            implementing, maintaining, and continually improving an Information Security Management System (ISMS).
            It helps organizations secure critical information, reduce risks, and protect confidentiality, integrity,
            and availability of data.
          </p>
          <p>
            This standard was developed by the <strong>International Organization for Standardization (ISO)</strong>{' '}
            and the <strong>International Electrotechnical Commission (IEC)</strong>. It is widely recognized as the
            benchmark for managing information security.
          </p>
        </section>

        {/* Why ISO Section */}
        <section
          style={{
            marginTop: '40px',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <h2 style={{ fontSize: '2rem', color: '#003366' }}>Why ISO/IEC 27001 Matters?</h2>
          <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#666' }}>
            <li>
              **Protects Data**: Ensures sensitive information remains confidential and secure.
            </li>
            <li>
              **Minimizes Risks**: Identifies vulnerabilities and addresses potential threats effectively.
            </li>
            <li>
              **Builds Trust**: Demonstrates to customers and stakeholders your commitment to data security.
            </li>
            <li>
              **Compliance**: Helps organizations meet regulatory and legal requirements.
            </li>
          </ul>
        </section>

        {/* Call to Action */}
        <section style={{ textAlign: 'center', marginTop: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#003366' }}>Get Started with ISMS Today!</h2>
          <p style={{ fontSize: '1.1rem', color: '#666' }}>
            Ready to secure your organization's data? Our platform provides everything you need for ISO/IEC 27001
            compliance.
          </p>
          <button
            style={{
              background: '#0066cc',
              color: '#fff',
              padding: '10px 20px',
              fontSize: '1rem',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px',
            }}
          >
            Learn More
          </button>
        </section>

        {/* Footer */}
        <footer
          style={{
            marginTop: '60px',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#666',
            padding: '20px 0',
            borderTop: '1px solid #ccc',
          }}
        >
          <p>© 2025 Innovative Information Technology Consulting</p>
          <p>
            Follow us on{' '}
            <a href="#" style={{ color: '#0066cc', textDecoration: 'none' }}>
              LinkedIn
            </a>{' '}
            |{' '}
            <a href="#" style={{ color: '#0066cc', textDecoration: 'none' }}>
              Twitter
            </a>
          </p>
        </footer>
      </main>
    </>
  );
}
