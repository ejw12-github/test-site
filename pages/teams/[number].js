import { useRouter } from "next/router";

export default function TeamPage() {
  const router = useRouter();
  const { number } = router.query;

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Team Number</h1>
      <p style={{ fontSize: "2rem" }}>{number}</p>
    </div>
  );
}
