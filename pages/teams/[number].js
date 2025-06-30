import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";

export default function TeamPage() {
  const router = useRouter();
  const { number } = router.query;
  const [opr, setOpr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!number) return;

    async function fetchOPR() {
      setLoading(true);

      const query = `
        query GetTeamOPR($number: Int!) {
          teamByNumber(number: $number) {
            quickStats(season: 2024) {
              tot {
                value
              }
            }
          }
        }
      `;

      const res = await fetch("https://api.ftcscout.org/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { number: parseInt(number) } }),
      });

      const json = await res.json();
      const value = json?.data?.teamByNumber?.quickStats?.tot?.value;

      setOpr(value ?? "N/A");
      setLoading(false);
    }

    fetchOPR();
  }, [number]);

  return (
    <>
      <Head>
        <title>Team #{number} | FTC Scouting App</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />
        <style>{`
          body {
            margin: 0;
            background-color: #000;
            color: #fff;
            font-family: 'Inter', sans-serif;
          }
        `}</style>
      </Head>

      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#1e1e1e",
            padding: "40px",
            borderRadius: "12px",
            textAlign: "center",
            maxWidth: "400px",
            width: "100%",
            boxShadow: "0 0 20px rgba(255, 255, 255, 0.05)",
          }}
        >
          <h1 style={{ marginBottom: "16px", fontWeight: "600" }}>
            Team #{number}
          </h1>
          {loading ? (
            <p style={{ fontSize: "1.2rem" }}>Loading OPR...</p>
          ) : (
            <p style={{ fontSize: "2rem", fontWeight: "600" }}>
              Total OPR: {typeof opr === "number" ? opr.toFixed(2) : opr}
            </p>
          )}
        </div>
      </main>
    </>
  );
}
