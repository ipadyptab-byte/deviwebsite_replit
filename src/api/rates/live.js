export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php",
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Unable to fetch rates");
    }

    const data = await response.json();

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300"
    );

    res.status(200).json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
