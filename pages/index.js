export default function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>FTCMetrics</h1>
      <h3>Currently in development (this page is just a placeholder) ... please return later!</h3>
      <h3>If you want to test it, go to ftcmetrics.vercel.app/teams/(your team number)</h3>
      <h2>Expected feature list:</h2>
      <h4>- Team OPR scouting (including consistency and preformance over time)</h4>
      <h4>- Match predictions & predicted team rankings</h4>
      <h4>- Event results & playoff predictions</h4>
      <h4>- And more, coming soon!</h4>
      <h3>Bug tracker coming soon!</h3>
      <h5>This website currently uses the <a href="https://ftcscout.org/api">FTCScout API</a>. This will be switched to the <a href="https://ftc-events.firstinspires.org/api-docs/index.html">FIRST API</a> soon.</h5>
    </div>
  );
}
