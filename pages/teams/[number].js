import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";

export default function TeamPage() {
  const router = useRouter();
  const { number } = router.query;
  const [team, setTeam] = useState(null);
  const [stats, setStats] = useState({});
  const [events, setEvents] = useState([]);
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
              tot { value }
              auto { value }
              dc { value }
              eg { value }
            }
            events(season: 2024) {
              event {
                name
                start
                location {
                  city
                  state
                  country
                }
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

      if (data) {
        setTeam(data);
        setStats({
          total: data.quickStats?.tot?.value,
          auto: data.quickStats?.auto?.value,
          dc: data.quickStats?.dc?.value,
          eg: data.quickStats?.eg?.value,
        });
        setEvents(data.events ?? []);
      } else {
        setTeam(null);
        setStats({});
        setEvents([]);
      }

      setLoading(false);
    }

    fetchData();
  }, [number]);

  const infoStyle = {
    margin: "0.3em 0",
    fontSize: "0.95rem",
    color: "#aaa",
  };

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

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
              <p style={infoStyle}>{team.schoolName}</p>
              <p style={infoStyle}>
                {team.location.city}, {team.location.state}, {team.location.country}
              </p>
              <p style={infoStyle}>Rookie Year: {team.rookieYear}</p>

              <hr style={{ margin: "1.5em 0", borderColor: "#333" }} />

              <div style={{ fontSize: "1rem", textAlign: "left" }}>
                <p>
                  <strong>Total OPR:</strong>{" "}
                  {typeof stats.total === "number" ? stats.total.toFixed(2) : "N/A"}
                </p>
                <p>
                  <strong>Auto:</strong>{" "}
                  {typeof stats.auto === "number" ? stats.auto.toFixed(2) : "N/A"}
                </p>
                <p>
                  <strong>TeleOP:</strong>{" "}
                  {typeof stats.dc === "number" ? stats.dc.toFixed(2) : "N/A"}
                </p>
                <p>
                  <strong>Endgame:</strong>{" "}
                  {typeof stats.eg === "number" ? stats.eg.toFixed(2) : "N/A"}
                </p>
              </div>

              {/* Events section */}
              {events.length > 0 && (
                <>
                  <hr style={{ margin: "1.5em 0", borderColor: "#333" }} />
                  <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5em" }}>
                    2024 Events
                  </h2>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {events.map((e, idx) => (
                      <li
                        key={idx}
                        style={{
                          marginBottom: "0.8em",
                          fontSize: "0.95rem",
                          color: "#ccc",
                        }}
                      >
                        <strong>{e.event.name}</strong> — {formatDate(e.event.start)} —{" "}
                        {e.event.location.city}, {e.event.location.state},{" "}
                        {e.event.location.country}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          ) : (
            <p style={{ textAlign: "center" }}>Team not found.</p>
          )}
        </div>
      </main>
    </>
  );
}
