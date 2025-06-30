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
                end
                code
                location {
                  venue
                  city
                  state
                  country
                }
              }
              rank {
                rank
              }
              record {
                wins
                losses
                ties
              }
              rp
              npAvg
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

      if (!data || Object.keys(data).length === 0) {
        setTeam(null);
        setLoading(false);
        return;
      }

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
                matchType
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
          .filter((m) => m.matchNum < 10000 && m.matchType === "QUAL")
          .sort((a, b) => a.matchNum - b.matchNum);
      }
      setMatchesByEvent(matchesObj);
      setLoading(false);
    }

    fetchData();
  }, [number]);

  // ... rest of the component remains unchanged

  return (
    <main>
      {loading ? (
        <p>Loading...</p>
      ) : !team ? (
        <p style={{ textAlign: "center" }}>Team not found.</p>
      ) : (
        <p>Render full UI here</p>
      )}
    </main>
  );
}
