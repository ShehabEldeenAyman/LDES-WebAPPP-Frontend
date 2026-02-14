import { replicateLDES } from "ldes-client";

export async function fetchLDESData(URL) {
  console.log(`fetching LDES data from ${URL}...`);
  const allQuads = [];
  var count = 0;
    try {
    const ldesClient = replicateLDES({
      url: URL,
      fetchOptions: { redirect: "follow" }
    });

    const memberReader = ldesClient.stream({ materialize: true }).getReader();

    let result = await memberReader.read();
    while (!result.done) {
      allQuads.push(...result.value.quads);
      result = await memberReader.read();
    }

} catch (error) {
    console.error("Error fetching LDES data:", error);
  }

}