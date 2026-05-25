import https from "https";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", reject);
  });
}

async function main() {
  const data = await fetchUrl("https://ip-ranges.amazonaws.com/ip-ranges.json");
  const targetIp = "2406:da14:311:1500:3c3d:2890:de88:e717";
  
  console.log("Searching for region matching:", targetIp);
  
  // We can convert IPv6 addresses to bigints or parse the CIDRs.
  // But since we want to find the prefix that matches, let's do a simple comparison.
  // In our case, 2406:da14:311:1500:: is in some block.
  // Let's filter prefixes starting with 2406:da14
  const prefixes = data.ipv6_prefixes.filter(p => p.ipv6_prefix.startsWith("2406:da14"));
  console.log("Matching prefixes:", prefixes);
}

main().catch(console.error);
