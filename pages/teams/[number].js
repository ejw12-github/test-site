import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";

export default function TeamPage() {
  const router = useRouter();
  const { number } = router.query;
  const [team, setTeam] = useState(null);
  const [opr, setOpr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!number) return;

    async function fetchData() {
      setLoading(true);

      const query = `
        query GetTeamData($number: Int!) {
          teamByNumber(number: $number) {
            name
            schoolName
            sponsors
            rookieYear
            location {
              city
              state
              country
            }
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
        body: JSON.stringify({
          query,
          variables: { number: parseInt(number) },
        }),
      });

      const json = await res.json();
      const data = json?.data?.teamByNumber;
      if (!data) {
        setTeam(null);
        setOpr(null);
      } else {
        setTeam(data);
        setOpr(data.quickStats?.tot?.value ?? "N/A");
      }

      setLoading(false);
    }

    fetchData();
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
            padding: "30px",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "600px",
            boxShadow: "0 0 10px rgba(255,255,255,0.05)",
          }}
        >
          {loading ? (
            <p style={{ fontSize: "1.2rem", textAlign: "center" }}>Loading...</p>
          ) : team ? (
            <>
              <h1 style={{ marginBottom: "0.3em", fontSize: "1.8rem", fontWeight: "600" }}>
                {number} – {team.name}
              </h1>
              <p style={{ margin: "0.3em 0" }}>{team.schoolName}</p>
              {team.location && (
                <p style={{ margin: "0.3em 0", fontSize: "0.95rem", color: "#aaa" }}>
                  {team.location.city}, {team.location.state}, {team.location.country}
                </p>
              )}
              <p style={{ margin: "0.3em 0", fontSize: "0.9rem", color: "#888" }}>
                Rookie Year: {team.rookieYear}
              </p>
              <hr style={{ margin: "1.5em 0", borderColor: "#333" }} />
              <p style={{ fontSize: "1.3rem", textAlign: "center", fontWeight: "500" }}>
                Total OPR:{" "}
                <span style={{ fontWeight: "600" }}>
                  {typeof opr === "number" ? opr.toFixed(2) : opr}
                </span>
              </p>
            </>
          ) : (
            <p style={{ textAlign: "center" }}>Team not found.</p>
          )}
        </div>
      </main>
    </>
  );
}
