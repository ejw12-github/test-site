import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Team #{number}</h1>
      {loading ? (
        <p>Loading OPR...</p>
      ) : (
        <p style={{ fontSize: "2rem" }}>
          Total OPR: {typeof opr === "number" ? opr.toFixed(2) : opr}
        </p>
      )}
    </div>
  );
}
