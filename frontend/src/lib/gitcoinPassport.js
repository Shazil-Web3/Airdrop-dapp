const API_KEY = "RFafhHpq.CiCNcpQJ9HI9xxxWhWoU3pm6teKqYJ2H";
const SCORER_ID = "11722"; // Replace with your actual scorer_id if different
const BASE_URL = "https://api.passport.xyz";

export async function fetchPassportScore(address) {
  const url = `${BASE_URL}/v2/stamps/${SCORER_ID}/score/${address}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-API-KEY": API_KEY,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch Passport score");
  const data = await res.json();
  // Return both score and passing_score for UI logic
  return {
    score: parseFloat(data.score),
    passing: data.passing_score,
    threshold: parseFloat(data.threshold),
    ...data,
  };
} 