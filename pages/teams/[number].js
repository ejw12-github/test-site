import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function TeamPage() {
  const router = useRouter();
  const { number } = router.query;
  const [oprSum, setOprSum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!number) return;

    async function fetchOPR() {
      setLoading(true);

      const query = `
        query GetTeamOPR($number: Int!) {
          teamByNumber(number: $number) {
            events(season: 2024) {
              stats {
                ... on TeamEventStats2024 {
                  opr {
                    totalPoints
                  }
                }
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
      const events = json?.data?.teamByNumber?.events ?? [];

      const total = events
        .map((e) => e.stats?.opr?.totalPoints ?? 0)
        .reduce((acc, v) => acc + v, 0);

      setOprSum(total);
      setLoading(false);
    }

    fetchOPR();
  }, [number]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Team #{number}</h1>
      {loading ? (
        <p>Loading OPR...</p>
      ) : (
        <p style={{ fontSize: "2rem" }}>Total OPR: {oprSum.toFixed(2)}</p>
      )}
    </div>
  );
}
