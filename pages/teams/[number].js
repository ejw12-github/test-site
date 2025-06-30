import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";

export default function TeamPage() {
  const router = useRouter();
  const { number } = router.query;
  const [team, setTeam] = useState(null);
  const [stats, setStats] = useState({});
  const [events, setEvents] = useState([]);
  const [matchesByEvent, setMatchesByEvent] = useState({});
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
                code
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

        const sortedEvents = (data.events ?? []).sort(
          (a, b) => new Date(b.event.start) - new Date(a.event.start)
        );
        setEvents(sortedEvents);

        const matchQuery = `
          query EventMatches($code: String!, $team: Int!) {
            eventByCode(season: 2024, code: $code) {
              teamMatches(teamNumber: $team) {
                match {
                  id
                  matchNum
                  scores {
                    ... on MatchScores2024 {
                      red { totalPoints }
                      blue { totalPoints }
                    }
                  }
                  teams {
                    teamNumber
                    alliance
                    station
                  }
                }
              }
            }
          }
        `;

        const matchesObj = {};
        for (const e of sortedEvents) {
          const res = await fetch("https://api.ftcscout.org/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: matchQuery,
              variables: {
                code: e.event.code,
                team: parseInt(number),
              },
            }),
          });
          const json = await res.json();
          const matches =
            json?.data?.eventByCode?.teamMatches?.map((m) => m.match) || [];

          matchesObj[e.event.code] = matches
            .filter((m) => m.matchNum < 10000)
            .sort((a, b) => a.id - b.id);
        }
        setMatchesByEvent(matchesObj);
      }

      setLoading(false);
    }

    fetchData();
  }, [number]);

  const boxStyle = {
    backgroundColor: "#1e1e1e",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 0 10px rgba(255,255,255,0.05)",
  };

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

  function renderMatchTable(matches) {
    return (
      <table style={{ width: "100%", marginTop: "1em", fontSize: "0.9rem", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={cellStyle}>Red 1</th>
            <th style={cellStyle}>Red 2</th>
            <th style={cellStyle}>Red Score</th>
            <th style={cellStyle}>Blue Score</th>
            <th style={cellStyle}>Blue 2</th>
            <th style={cellStyle}>Blue 1</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m, idx) => {
            const teams = m.teams.reduce(
              (acc, t) => {
                acc[t.alliance]?.push(t.teamNumber);
                return acc;
              },
              { Red: [], Blue: [] }
            );
            const redScore = m.scores?.red?.totalPoints ?? 0;
            const blueScore = m.scores?.blue?.totalPoints ?? 0;
            const redWin = redScore > blueScore;
            const blueWin = blueScore > redScore;

            return (
              <tr key={idx}>
                <td style={{ ...cellStyle, backgroundColor: "#440000" }}>{teams.Red[0]}</td>
                <td style={{ ...cellStyle, backgroundColor: "#440000" }}>{teams.Red[1]}</td>
                <td style={{
                  ...cellStyle,
                  backgroundColor: "#440000",
                  color: redWin ? "#f44" : "#fff",
                  fontWeight: redWin ? "bold" : "normal"
                }}>{redScore}</td>
                <td style={{
                  ...cellStyle,
                  backgroundColor: "#000044",
                  color: blueWin ? "#44f" : "#fff",
                  fontWeight: blueWin ? "bold" : "normal"
                }}>{blueScore}</td>
                <td style={{ ...cellStyle, backgroundColor: "#000044" }}>{teams.Blue[1]}</td>
                <td style={{ ...cellStyle, backgroundColor: "#000044" }}>{teams.Blue[0]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  const cellStyle = {
    border: "1px solid #555",
    padding: "6px",
    textAlign: "center",
  };

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

      <main style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "40px 20px",
      }}>
        <div style={{ width: "100%", maxWidth: "800px" }}>
          {loading ? (
            <p style={{ fontSize: "1.2rem", textAlign: "center" }}>Loading...</p>
          ) : team ? (
            <>
              <div style={boxStyle}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: "600" }}>
                  {number} – {team.name}
                </h1>
                <p style={infoStyle}>{team.schoolName}</p>
                <p style={infoStyle}>
                  {team.location.city}, {team.location.state}, {team.location.country}
                </p>
                <p style={infoStyle}>Rookie Year: {team.rookieYear}</p>
              </div>

              <div style={boxStyle}>
                <h2 style={{ fontSize: "1.2rem", marginBottom: "1em" }}>OPR Breakdown</h2>
                <p><strong>Total OPR:</strong> {stats.total?.toFixed(2) ?? "N/A"}</p>
                <p><strong>Auto:</strong> {stats.auto?.toFixed(2) ?? "N/A"}</p>
                <p><strong>TeleOP:</strong> {stats.dc?.toFixed(2) ?? "N/A"}</p>
                <p><strong>Endgame:</strong> {stats.eg?.toFixed(2) ?? "N/A"}</p>
              </div>

              {events.map((e, idx) => (
                <div key={idx} style={boxStyle}>
                  <h3 style={{ margin: "0 0 0.4em 0" }}>{e.event.name}</h3>
                  <p style={infoStyle}>📅 {formatDate(e.event.start)}</p>
                  <p style={infoStyle}>📍 {e.event.location.city}, {e.event.location.state}, {e.event.location.country}</p>
                  {matchesByEvent[e.event.code]?.length > 0 && renderMatchTable(matchesByEvent[e.event.code])}
                </div>
              ))}
            </>
          ) : (
            <p style={{ textAlign: "center" }}>Team not found.</p>
          )}
        </div>
      </main>
    </>
  );
}
